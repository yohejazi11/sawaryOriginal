<?php

class ProjectsController
{
    private static function mapCategory(array $row): array
    {
        return [
            'id' => (int) $row['cat_id'],
            'name' => $row['cat_name'],
            'slug' => $row['cat_slug'],
            'type' => $row['cat_type'],
            'orderIndex' => (int) $row['cat_order_index'],
        ];
    }

    private static function mapListRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'location' => $row['location'],
            'year' => $row['year'],
            'isFeatured' => (bool) $row['is_featured'],
            'orderIndex' => (int) $row['order_index'],
            'coverImageUrl' => $row['cover_image_url'],
            'imageCount' => (int) $row['image_count'],
            'category' => self::mapCategory($row),
        ];
    }

    private static function mapImage(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'url' => $row['url'],
            'publicId' => $row['public_id'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function mapFullProject(array $row, array $images): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'],
            'location' => $row['location'],
            'year' => $row['year'],
            'isFeatured' => (bool) $row['is_featured'],
            'orderIndex' => (int) $row['order_index'],
            'createdAt' => self::formatDate($row['created_at']),
            'coverImageUrl' => $row['cover_image_url'],
            'category' => self::mapCategory($row),
            'images' => array_map([self::class, 'mapImage'], $images),
        ];
    }

    private static function formatDate(string $datetime): string
    {
        $ts = strtotime($datetime);
        return gmdate('Y-m-d\TH:i:s', $ts);
    }

    private static function categoryJoin(): string
    {
        return '
            p.*,
            c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.type AS cat_type, c.order_index AS cat_order_index
        ';
    }

    public static function getAll(): void
    {
        $db = Database::get();

        $where = [];
        $params = [];

        if (isset($_GET['categoryId']) && $_GET['categoryId'] !== '') {
            $where[] = 'p.category_id = ?';
            $params[] = (int) $_GET['categoryId'];
        }

        if (isset($_GET['type']) && $_GET['type'] !== '') {
            $where[] = 'c.type = ?';
            $params[] = $_GET['type'];
        }

        if (isset($_GET['featured']) && $_GET['featured'] !== '') {
            $where[] = 'p.is_featured = ?';
            $params[] = filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = '
            SELECT ' . self::categoryJoin() . ',
                (SELECT COUNT(*) FROM project_images pi WHERE pi.project_id = p.id) AS image_count
            FROM projects p
            JOIN categories c ON c.id = p.category_id
            ' . $whereSql . '
            ORDER BY p.order_index, p.created_at DESC
        ';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        Response::json(array_map([self::class, 'mapListRow'], $rows));
    }

    private static function findProjectRow(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('
            SELECT ' . self::categoryJoin() . '
            FROM projects p
            JOIN categories c ON c.id = p.category_id
            WHERE p.id = ?
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function findProjectRowBySlug(PDO $db, string $slug): ?array
    {
        $stmt = $db->prepare('
            SELECT ' . self::categoryJoin() . '
            FROM projects p
            JOIN categories c ON c.id = p.category_id
            WHERE p.slug = ?
        ');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function getImagesForProject(PDO $db, int $projectId): array
    {
        $stmt = $db->prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY order_index');
        $stmt->execute([$projectId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): void
    {
        $db = Database::get();
        $row = self::findProjectRow($db, $id);

        if (!$row) {
            Response::error('Not Found', 404);
        }

        $images = self::getImagesForProject($db, $id);
        Response::json(self::mapFullProject($row, $images));
    }

    public static function getBySlug(string $slug): void
    {
        $db = Database::get();
        $row = self::findProjectRowBySlug($db, $slug);

        if (!$row) {
            Response::error('Not Found', 404);
        }

        $images = self::getImagesForProject($db, (int) $row['id']);
        Response::json(self::mapFullProject($row, $images));
    }

    public static function create(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['name', 'categoryId']);

        $db = Database::get();

        $stmt = $db->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->execute([(int) $body['categoryId']]);
        if (!$stmt->fetch()) {
            Response::error('Category not found', 400);
        }

        $slug = Slug::uniqueSlug($db, 'projects', $body['name']);
        $createdAt = gmdate('Y-m-d H:i:s');

        $stmt = $db->prepare('
            INSERT INTO projects (name, slug, description, location, year, is_featured, order_index, created_at, category_id, cover_image_url)
            VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, \'\')
        ');
        $stmt->execute([
            $body['name'],
            $slug,
            $body['description'] ?? null,
            $body['location'] ?? null,
            $body['year'] ?? null,
            $createdAt,
            (int) $body['categoryId'],
        ]);

        $id = (int) $db->lastInsertId();
        $row = self::findProjectRow($db, $id);

        Response::json(self::mapFullProject($row, []), 201);
    }

    public static function update(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $categoryId = $project['category_id'];
        if (isset($body['categoryId'])) {
            $stmt = $db->prepare('SELECT * FROM categories WHERE id = ?');
            $stmt->execute([(int) $body['categoryId']]);
            if (!$stmt->fetch()) {
                Response::error('Category not found', 400);
            }
            $categoryId = (int) $body['categoryId'];
        }

        $name = $body['name'] ?? $project['name'];
        $description = $body['description'] ?? $project['description'];
        $location = $body['location'] ?? $project['location'];
        $year = $body['year'] ?? $project['year'];

        $stmt = $db->prepare('
            UPDATE projects
            SET name = ?, description = ?, location = ?, year = ?, category_id = ?
            WHERE id = ?
        ');
        $stmt->execute([$name, $description, $location, $year, $categoryId, $id]);

        Response::noContent();
    }

    public static function delete(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        $images = self::getImagesForProject($db, $id);
        foreach ($images as $image) {
            if (!empty($image['public_id'])) {
                $path = __DIR__ . '/../../' . $image['public_id'];
                if (file_exists($path)) {
                    unlink($path);
                }
            }
        }

        $stmt = $db->prepare('DELETE FROM projects WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function toggleFeatured(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        $newValue = $project['is_featured'] ? 0 : 1;

        $stmt = $db->prepare('UPDATE projects SET is_featured = ? WHERE id = ?');
        $stmt->execute([$newValue, $id]);

        Response::json(['isFeatured' => (bool) $newValue]);
    }

    public static function updateOrder(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $project = $stmt->fetch();

        if (!$project) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE projects SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $id]);

        Response::noContent();
    }
}
