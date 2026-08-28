<?php

class ServiceSectionsController
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

    private static function mapSection(array $row, array $cards): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'description' => $row['description'],
            'heroImageUrl' => $row['hero_image_url'],
            'orderIndex' => (int) $row['order_index'],
            'cards' => array_map([self::class, 'mapCard'], $cards),
        ];
    }

    private static function getCardsForSection(PDO $db, int $sectionId): array
    {
        $stmt = $db->prepare('SELECT * FROM service_cards WHERE section_id = ? ORDER BY order_index');
        $stmt->execute([$sectionId]);
        return $stmt->fetchAll();
    }

    private static function findSection(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM service_sections WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function findSectionBySlug(PDO $db, string $slug): ?array
    {
        $stmt = $db->prepare('SELECT * FROM service_sections WHERE slug = ?');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function baseUrl(): string
    {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return "{$scheme}://{$host}";
    }

    private static function deleteUploadedFile(?string $publicId): void
    {
        if (empty($publicId)) {
            return;
        }
        $path = __DIR__ . '/../../' . $publicId;
        if (file_exists($path)) {
            unlink($path);
        }
    }

    public static function getAll(): void
    {
        $db = Database::get();
        $stmt = $db->query('SELECT * FROM service_sections ORDER BY order_index');
        $sections = $stmt->fetchAll();

        $result = array_map(function (array $row) use ($db) {
            return self::mapSection($row, self::getCardsForSection($db, (int) $row['id']));
        }, $sections);

        Response::json($result);
    }

    public static function getById(int $id): void
    {
        $db = Database::get();
        $row = self::findSection($db, $id);

        if (!$row) {
            Response::error('Not Found', 404);
        }

        Response::json(self::mapSection($row, self::getCardsForSection($db, $id)));
    }

    public static function getBySlug(string $slug): void
    {
        $db = Database::get();
        $row = self::findSectionBySlug($db, $slug);

        if (!$row) {
            Response::error('Not Found', 404);
        }

        Response::json(self::mapSection($row, self::getCardsForSection($db, (int) $row['id'])));
    }

    public static function create(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['title']);

        $db = Database::get();
        $slug = Slug::uniqueSlug($db, 'service_sections', $body['title']);
        $orderIndex = (int) ($body['orderIndex'] ?? 0);

        $stmt = $db->prepare('
            INSERT INTO service_sections (title, slug, description, hero_image_url, order_index)
            VALUES (?, ?, ?, \'\', ?)
        ');
        $stmt->execute([$body['title'], $slug, $body['description'] ?? null, $orderIndex]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapSection(self::findSection($db, $id), []), 201);
    }

    public static function update(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $section = self::findSection($db, $id);

        if (!$section) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $title = $body['title'] ?? $section['title'];
        $description = $body['description'] ?? $section['description'];
        $orderIndex = $body['orderIndex'] ?? $section['order_index'];

        $stmt = $db->prepare('UPDATE service_sections SET title = ?, description = ?, order_index = ? WHERE id = ?');
        $stmt->execute([$title, $description, $orderIndex, $id]);

        Response::noContent();
    }

    public static function delete(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $section = self::findSection($db, $id);

        if (!$section) {
            Response::error('Not Found', 404);
        }

        foreach (self::getCardsForSection($db, $id) as $card) {
            self::deleteUploadedFile($card['public_id']);
        }
        self::deleteUploadedFile($section['hero_image_public_id']);

        $stmt = $db->prepare('DELETE FROM service_sections WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function uploadHero(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $section = self::findSection($db, $id);

        if (!$section) {
            Response::error('Not Found', 404);
        }

        if (empty($_FILES['image'])) {
            Response::error('No image uploaded', 400);
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

        $uploadDir = __DIR__ . '/../../uploads/services/' . $section['slug'];
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $fileName = 'hero-' . bin2hex(random_bytes(8)) . '.' . $ext;
        move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $fileName);

        $relativePath = 'uploads/services/' . $section['slug'] . '/' . $fileName;
        $url = self::baseUrl() . '/api/' . $relativePath;

        self::deleteUploadedFile($section['hero_image_public_id']);

        $stmt = $db->prepare('UPDATE service_sections SET hero_image_url = ?, hero_image_public_id = ? WHERE id = ?');
        $stmt->execute([$url, $relativePath, $id]);

        Response::json(['heroImageUrl' => $url]);
    }
}
