<?php

class CategoriesController
{
    private static function mapRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'type' => $row['type'],
            'orderIndex' => (int) $row['order_index'],
            'projectCount' => (int) ($row['project_count'] ?? 0),
        ];
    }

    public static function getAll(): void
    {
        $db = Database::get();
        $stmt = $db->query('
            SELECT c.*, COUNT(p.id) AS project_count
            FROM categories c
            LEFT JOIN projects p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.order_index
        ');

        $rows = $stmt->fetchAll();
        Response::json(array_map([self::class, 'mapRow'], $rows));
    }

    public static function getById(int $id): void
    {
        $db = Database::get();
        $stmt = $db->prepare('
            SELECT c.*, COUNT(p.id) AS project_count
            FROM categories c
            LEFT JOIN projects p ON p.category_id = c.id
            WHERE c.id = ?
            GROUP BY c.id
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Not Found', 404);
        }

        Response::json(self::mapRow($row));
    }

    public static function getBySlug(string $slug): void
    {
        $db = Database::get();
        $stmt = $db->prepare('
            SELECT c.*, COUNT(p.id) AS project_count
            FROM categories c
            LEFT JOIN projects p ON p.category_id = c.id
            WHERE c.slug = ?
            GROUP BY c.id
        ');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Not Found', 404);
        }

        Response::json(self::mapRow($row));
    }

    public static function create(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['name', 'type']);

        $db = Database::get();
        $slug = Slug::uniqueSlug($db, 'categories', $body['name']);
        $orderIndex = (int) ($body['orderIndex'] ?? 0);

        $stmt = $db->prepare('INSERT INTO categories (name, slug, type, order_index) VALUES (?, ?, ?, ?)');
        $stmt->execute([$body['name'], $slug, $body['type'], $orderIndex]);

        $id = (int) $db->lastInsertId();

        Response::json([
            'id' => $id,
            'name' => $body['name'],
            'slug' => $slug,
            'type' => $body['type'],
            'orderIndex' => $orderIndex,
            'projectCount' => 0,
        ], 201);
    }

    public static function update(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        if (!$category) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name = $body['name'] ?? $category['name'];
        $type = $body['type'] ?? $category['type'];
        $orderIndex = $body['orderIndex'] ?? $category['order_index'];

        $stmt = $db->prepare('UPDATE categories SET name = ?, type = ?, order_index = ? WHERE id = ?');
        $stmt->execute([$name, $type, $orderIndex, $id]);

        Response::noContent();
    }

    public static function delete(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('
            SELECT c.*, COUNT(p.id) AS project_count
            FROM categories c
            LEFT JOIN projects p ON p.category_id = c.id
            WHERE c.id = ?
            GROUP BY c.id
        ');
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        if (!$category) {
            Response::error('Not Found', 404);
        }

        if ((int) $category['project_count'] > 0) {
            Response::error('لا يمكن حذف تصنيف يحتوي على مشاريع', 400);
        }

        $stmt = $db->prepare('DELETE FROM categories WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }
}
