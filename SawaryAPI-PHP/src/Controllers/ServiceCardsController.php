<?php

class ServiceCardsController
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private static function mapCard(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'imageUrl' => $row['image_url'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function findCard(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM service_cards WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(int $sectionId): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM service_sections WHERE id = ?');
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();

        if (!$section) {
            Response::error('Not Found', 404);
        }

        $title = trim($_POST['title'] ?? '');
        if ($title === '') {
            Response::error('العنوان مطلوب', 400);
        }

        if (empty($_FILES['image'])) {
            Response::error('الصورة مطلوبة', 400);
        }

        $file = $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Upload error', 400);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
            Response::error('Invalid file type', 400);
        }

        if ($file['size'] > self::MAX_FILE_SIZE) {
            Response::error('File too large', 400);
        }

        $uploadDir = __DIR__ . '/../../uploads/services/' . $section['slug'] . '/cards';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . $ext;
        move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $fileName);

        $relativePath = 'uploads/services/' . $section['slug'] . '/cards/' . $fileName;
        $url = ServiceSectionsController::baseUrl() . '/api/' . $relativePath;

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM service_cards WHERE section_id = ?');
        $stmt->execute([$sectionId]);
        $orderIndex = (int) $stmt->fetchColumn() + 1;

        $stmt = $db->prepare('
            INSERT INTO service_cards (title, image_url, public_id, order_index, section_id)
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmt->execute([$title, $url, $relativePath, $orderIndex, $sectionId]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapCard([
            'id' => $id,
            'title' => $title,
            'image_url' => $url,
            'order_index' => $orderIndex,
        ]), 201);
    }

    public static function update(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $card = self::findCard($db, $id);

        if (!$card) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $title = $body['title'] ?? $card['title'];
        $orderIndex = $body['orderIndex'] ?? $card['order_index'];

        $stmt = $db->prepare('UPDATE service_cards SET title = ?, order_index = ? WHERE id = ?');
        $stmt->execute([$title, $orderIndex, $id]);

        Response::noContent();
    }

    public static function delete(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $card = self::findCard($db, $id);

        if (!$card) {
            Response::error('Not Found', 404);
        }

        if (!empty($card['public_id'])) {
            $path = __DIR__ . '/../../' . $card['public_id'];
            if (file_exists($path)) {
                unlink($path);
            }
        }

        $stmt = $db->prepare('DELETE FROM service_cards WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }
}
