<?php

class ImagesController
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private const MAX_FILES = 20;

    private static function mapImage(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'url' => $row['url'],
            'publicId' => $row['public_id'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function baseUrl(): string
    {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return "{$scheme}://{$host}";
    }

    public static function upload(int $projectId): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        if (empty($_FILES['files'])) {
            Response::error('No files uploaded', 400);
        }

        $files = $_FILES['files'];
        if (!is_array($files['name'])) {
            foreach ($files as $key => $value) {
                $files[$key] = [$value];
            }
        }
        $fileCount = count($files['name']);

        if ($fileCount < 1 || $fileCount > self::MAX_FILES) {
            Response::error('You can upload between 1 and 20 files', 400);
        }

        // Validate all files before saving any.
        for ($i = 0; $i < $fileCount; $i++) {
            $name = $files['name'][$i];
            $size = $files['size'][$i];
            $error = $files['error'][$i];

            if ($error !== UPLOAD_ERR_OK) {
                Response::error("Upload error for file: {$name}", 400);
            }

            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
                Response::error("Invalid file type: {$name}", 400);
            }

            if ($size > self::MAX_FILE_SIZE) {
                Response::error("File too large: {$name}", 400);
            }
        }

        $uploadDir = __DIR__ . '/../../uploads/' . $project['slug'];
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM project_images WHERE project_id = ?');
        $stmt->execute([$projectId]);
        $nextOrderIndex = (int) $stmt->fetchColumn() + 1;

        $hasCover = !empty($project['cover_image_url']);
        $inserted = [];

        $insertStmt = $db->prepare('
            INSERT INTO project_images (url, public_id, order_index, project_id)
            VALUES (?, ?, ?, ?)
        ');

        for ($i = 0; $i < $fileCount; $i++) {
            $tmpName = $files['tmp_name'][$i];
            $originalName = $files['name'][$i];
            $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            $fileName = bin2hex(random_bytes(16)) . '.' . $ext;
            $destination = $uploadDir . '/' . $fileName;
            move_uploaded_file($tmpName, $destination);

            $relativePath = 'uploads/' . $project['slug'] . '/' . $fileName;
            $url = self::baseUrl() . '/api/' . $relativePath;
            $orderIndex = $nextOrderIndex + $i;

            $insertStmt->execute([$url, $relativePath, $orderIndex, $projectId]);
            $imageId = (int) $db->lastInsertId();

            if (!$hasCover) {
                $stmt = $db->prepare('UPDATE projects SET cover_image_url = ? WHERE id = ?');
                $stmt->execute([$url, $projectId]);
                $hasCover = true;
            }

            $inserted[] = [
                'id' => $imageId,
                'url' => $url,
                'publicId' => $relativePath,
                'orderIndex' => $orderIndex,
            ];
        }

        Response::json($inserted);
    }

    public static function delete(int $imageId): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM project_images WHERE id = ?');
        $stmt->execute([$imageId]);
        $image = $stmt->fetch();

        if (!$image) {
            Response::error('Not Found', 404);
        }

        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$image['project_id']]);
        $project = $stmt->fetch();

        if (!empty($image['public_id'])) {
            $path = __DIR__ . '/../../' . $image['public_id'];
            if (file_exists($path)) {
                unlink($path);
            }
        }

        $stmt = $db->prepare('DELETE FROM project_images WHERE id = ?');
        $stmt->execute([$imageId]);

        if ($project && $project['cover_image_url'] === $image['url']) {
            $stmt = $db->prepare('
                SELECT url FROM project_images
                WHERE project_id = ?
                ORDER BY order_index
                LIMIT 1
            ');
            $stmt->execute([$image['project_id']]);
            $nextCover = $stmt->fetchColumn();

            $stmt = $db->prepare('UPDATE projects SET cover_image_url = ? WHERE id = ?');
            $stmt->execute([$nextCover !== false ? $nextCover : '', $image['project_id']]);
        }

        Response::noContent();
    }

    public static function updateOrder(int $imageId): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM project_images WHERE id = ?');
        $stmt->execute([$imageId]);
        $image = $stmt->fetch();

        if (!$image) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE project_images SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $imageId]);

        Response::noContent();
    }

    public static function setCover(int $projectId): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['imageId']);

        $stmt = $db->prepare('SELECT * FROM project_images WHERE id = ? AND project_id = ?');
        $stmt->execute([(int) $body['imageId'], $projectId]);
        $image = $stmt->fetch();

        if (!$image) {
            Response::error('Image not found in this project', 404);
        }

        $stmt = $db->prepare('UPDATE projects SET cover_image_url = ? WHERE id = ?');
        $stmt->execute([$image['url'], $projectId]);

        Response::json(['coverImageUrl' => $image['url']]);
    }
}
