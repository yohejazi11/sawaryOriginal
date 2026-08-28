<?php

class AboutController
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // ── Mapping ──────────────────────────────────────────────────────────────

    private static function mapFaqItem(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'questionAr' => $row['question_ar'],
            'questionEn' => $row['question_en'],
            'answerAr' => $row['answer_ar'],
            'answerEn' => $row['answer_en'],
            'actionLabelAr' => $row['action_label_ar'],
            'actionLabelEn' => $row['action_label_en'],
            'actionHref' => $row['action_href'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function mapStatItem(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'labelAr' => $row['label_ar'],
            'labelEn' => $row['label_en'],
            'value' => (int) $row['value'],
            'suffix' => $row['suffix'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function mapContent(array $row, array $faqItems, array $statItems): array
    {
        return [
            'heroTitleAr' => $row['hero_title_ar'],
            'heroTitleEn' => $row['hero_title_en'],
            'heroStatementAr' => $row['hero_statement_ar'],
            'heroStatementEn' => $row['hero_statement_en'],
            'heroScrollHintAr' => $row['hero_scroll_hint_ar'],
            'heroScrollHintEn' => $row['hero_scroll_hint_en'],
            'visionTitleAr' => $row['vision_title_ar'],
            'visionTitleEn' => $row['vision_title_en'],
            'visionBodyAr' => $row['vision_body_ar'],
            'visionBodyEn' => $row['vision_body_en'],
            'teamTitleAr' => $row['team_title_ar'],
            'teamTitleEn' => $row['team_title_en'],
            'teamImageAltAr' => $row['team_image_alt_ar'],
            'teamImageAltEn' => $row['team_image_alt_en'],
            'teamPhotoUrl' => $row['team_photo_url'],
            'teamPhotoWidth' => $row['team_photo_width'] !== null ? (int) $row['team_photo_width'] : null,
            'teamPhotoHeight' => $row['team_photo_height'] !== null ? (int) $row['team_photo_height'] : null,
            'faqTitleAr' => $row['faq_title_ar'],
            'faqTitleEn' => $row['faq_title_en'],
            'locationTitleAr' => $row['location_title_ar'],
            'locationTitleEn' => $row['location_title_en'],
            'locationAddressAr' => $row['location_address_ar'],
            'locationAddressEn' => $row['location_address_en'],
            'locationMapTitleAr' => $row['location_map_title_ar'],
            'locationMapTitleEn' => $row['location_map_title_en'],
            'locationMapComingSoonAr' => $row['location_map_coming_soon_ar'],
            'locationMapComingSoonEn' => $row['location_map_coming_soon_en'],
            'locationGalleryAltAr' => $row['location_gallery_alt_ar'],
            'locationGalleryAltEn' => $row['location_gallery_alt_en'],
            'sectionLabelWhoWeAreAr' => $row['section_label_who_we_are_ar'],
            'sectionLabelWhoWeAreEn' => $row['section_label_who_we_are_en'],
            'sectionLabelTeamStructureAr' => $row['section_label_team_structure_ar'],
            'sectionLabelTeamStructureEn' => $row['section_label_team_structure_en'],
            'sectionLabelFaqAr' => $row['section_label_faq_ar'],
            'sectionLabelFaqEn' => $row['section_label_faq_en'],
            'sectionLabelVisitUsAr' => $row['section_label_visit_us_ar'],
            'sectionLabelVisitUsEn' => $row['section_label_visit_us_en'],
            'sectionLabelStatsAr' => $row['section_label_stats_ar'],
            'sectionLabelStatsEn' => $row['section_label_stats_en'],
            'faqItems' => array_map([self::class, 'mapFaqItem'], $faqItems),
            'statItems' => array_map([self::class, 'mapStatItem'], $statItems),
        ];
    }

    // jsonKey => column map, driving the partial-patch update() below so the 36-field PUT
    // doesn't need 36 repeated "$x = $body['x'] ?? $existing['x_col'];" lines.
    private static function scalarFieldMap(): array
    {
        return [
            'heroTitleAr' => 'hero_title_ar', 'heroTitleEn' => 'hero_title_en',
            'heroStatementAr' => 'hero_statement_ar', 'heroStatementEn' => 'hero_statement_en',
            'heroScrollHintAr' => 'hero_scroll_hint_ar', 'heroScrollHintEn' => 'hero_scroll_hint_en',
            'visionTitleAr' => 'vision_title_ar', 'visionTitleEn' => 'vision_title_en',
            'visionBodyAr' => 'vision_body_ar', 'visionBodyEn' => 'vision_body_en',
            'teamTitleAr' => 'team_title_ar', 'teamTitleEn' => 'team_title_en',
            'teamImageAltAr' => 'team_image_alt_ar', 'teamImageAltEn' => 'team_image_alt_en',
            'faqTitleAr' => 'faq_title_ar', 'faqTitleEn' => 'faq_title_en',
            'locationTitleAr' => 'location_title_ar', 'locationTitleEn' => 'location_title_en',
            'locationAddressAr' => 'location_address_ar', 'locationAddressEn' => 'location_address_en',
            'locationMapTitleAr' => 'location_map_title_ar', 'locationMapTitleEn' => 'location_map_title_en',
            'locationMapComingSoonAr' => 'location_map_coming_soon_ar', 'locationMapComingSoonEn' => 'location_map_coming_soon_en',
            'locationGalleryAltAr' => 'location_gallery_alt_ar', 'locationGalleryAltEn' => 'location_gallery_alt_en',
            'sectionLabelWhoWeAreAr' => 'section_label_who_we_are_ar', 'sectionLabelWhoWeAreEn' => 'section_label_who_we_are_en',
            'sectionLabelTeamStructureAr' => 'section_label_team_structure_ar', 'sectionLabelTeamStructureEn' => 'section_label_team_structure_en',
            'sectionLabelFaqAr' => 'section_label_faq_ar', 'sectionLabelFaqEn' => 'section_label_faq_en',
            'sectionLabelVisitUsAr' => 'section_label_visit_us_ar', 'sectionLabelVisitUsEn' => 'section_label_visit_us_en',
            'sectionLabelStatsAr' => 'section_label_stats_ar', 'sectionLabelStatsEn' => 'section_label_stats_en',
        ];
    }

    // ── Lookups ──────────────────────────────────────────────────────────────

    // Self-initializing singleton. Production always has the seeded id=1 row from
    // migration_about_contact.sql; this INSERT is only a safety net for a database that
    // ran the CREATE TABLE section without the seed section. hero_statement_*/vision_body_*
    // are TEXT with no column DEFAULT (MySQL disallows DEFAULT '' on TEXT before 8.0.13),
    // so they're passed explicitly; every other NOT NULL column already defaults to ''.
    private static function getOrCreate(PDO $db): array
    {
        $stmt = $db->query('SELECT * FROM about_content ORDER BY id LIMIT 1');
        $row = $stmt->fetch();
        if ($row) {
            return $row;
        }

        $db->exec("INSERT INTO about_content (hero_statement_ar, hero_statement_en, vision_body_ar, vision_body_en) VALUES ('', '', '', '')");
        $id = (int) $db->lastInsertId();

        $stmt = $db->prepare('SELECT * FROM about_content WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    private static function getFaqItems(PDO $db, int $aboutId): array
    {
        $stmt = $db->prepare('SELECT * FROM about_faq_items WHERE about_content_id = ? ORDER BY order_index');
        $stmt->execute([$aboutId]);
        return $stmt->fetchAll();
    }

    private static function getStatItems(PDO $db, int $aboutId): array
    {
        $stmt = $db->prepare('SELECT * FROM about_stat_items WHERE about_content_id = ? ORDER BY order_index');
        $stmt->execute([$aboutId]);
        return $stmt->fetchAll();
    }

    private static function findFaqItem(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM about_faq_items WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function findStatItem(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM about_stat_items WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // ── Singleton content ────────────────────────────────────────────────────

    public static function get(): void
    {
        $db = Database::get();
        $content = self::getOrCreate($db);
        Response::json(self::mapContent(
            $content,
            self::getFaqItems($db, (int) $content['id']),
            self::getStatItems($db, (int) $content['id'])
        ));
    }

    public static function update(): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $content = self::getOrCreate($db);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $set = [];
        $params = [];
        foreach (self::scalarFieldMap() as $jsonKey => $column) {
            $set[] = "{$column} = ?";
            $params[] = $body[$jsonKey] ?? $content[$column];
        }
        $params[] = (int) $content['id'];

        $stmt = $db->prepare('UPDATE about_content SET ' . implode(', ', $set) . ' WHERE id = ?');
        $stmt->execute($params);

        Response::noContent();
    }

    public static function uploadTeamPhoto(): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $content = self::getOrCreate($db);

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

        $uploadDir = __DIR__ . '/../../uploads/about';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $fileName = 'team-photo-' . bin2hex(random_bytes(8)) . '.' . $ext;
        $destination = $uploadDir . '/' . $fileName;
        move_uploaded_file($file['tmp_name'], $destination);

        $dimensions = @getimagesize($destination);
        $width = $dimensions ? (int) $dimensions[0] : null;
        $height = $dimensions ? (int) $dimensions[1] : null;

        $relativePath = 'uploads/about/' . $fileName;
        $url = ServiceSectionsController::baseUrl() . '/api/' . $relativePath;

        // The seeded default photo is a frontend static asset (public_id IS NULL) — never
        // unlink it. Only a prior backend-managed upload gets cleaned up here.
        if (!empty($content['team_photo_public_id'])) {
            $oldPath = __DIR__ . '/../../' . $content['team_photo_public_id'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        $stmt = $db->prepare('UPDATE about_content SET team_photo_url = ?, team_photo_public_id = ?, team_photo_width = ?, team_photo_height = ? WHERE id = ?');
        $stmt->execute([$url, $relativePath, $width, $height, (int) $content['id']]);

        Response::json(['teamPhotoUrl' => $url, 'width' => $width, 'height' => $height]);
    }

    // ── FAQ items ────────────────────────────────────────────────────────────

    public static function createFaqItem(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['questionAr', 'questionEn', 'answerAr', 'answerEn']);

        $db = Database::get();
        $content = self::getOrCreate($db);

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM about_faq_items WHERE about_content_id = ?');
        $stmt->execute([$content['id']]);
        $orderIndex = (int) $stmt->fetchColumn() + 1;

        $stmt = $db->prepare('
            INSERT INTO about_faq_items (about_content_id, question_ar, question_en, answer_ar, answer_en, action_label_ar, action_label_en, action_href, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $content['id'], $body['questionAr'], $body['questionEn'], $body['answerAr'], $body['answerEn'],
            $body['actionLabelAr'] ?? null, $body['actionLabelEn'] ?? null, $body['actionHref'] ?? null, $orderIndex,
        ]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapFaqItem(self::findFaqItem($db, $id)), 201);
    }

    public static function updateFaqItem(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findFaqItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $db->prepare('UPDATE about_faq_items SET question_ar = ?, question_en = ?, answer_ar = ?, answer_en = ?, action_label_ar = ?, action_label_en = ?, action_href = ? WHERE id = ?');
        $stmt->execute([
            $body['questionAr'] ?? $item['question_ar'],
            $body['questionEn'] ?? $item['question_en'],
            $body['answerAr'] ?? $item['answer_ar'],
            $body['answerEn'] ?? $item['answer_en'],
            $body['actionLabelAr'] ?? $item['action_label_ar'],
            $body['actionLabelEn'] ?? $item['action_label_en'],
            $body['actionHref'] ?? $item['action_href'],
            $id,
        ]);

        Response::noContent();
    }

    public static function deleteFaqItem(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findFaqItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $stmt = $db->prepare('DELETE FROM about_faq_items WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function updateFaqItemOrder(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findFaqItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE about_faq_items SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $id]);

        Response::noContent();
    }

    // ── Stat items ───────────────────────────────────────────────────────────

    public static function createStatItem(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['labelAr', 'labelEn', 'value']);

        $db = Database::get();
        $content = self::getOrCreate($db);

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM about_stat_items WHERE about_content_id = ?');
        $stmt->execute([$content['id']]);
        $orderIndex = (int) $stmt->fetchColumn() + 1;

        $stmt = $db->prepare('
            INSERT INTO about_stat_items (about_content_id, label_ar, label_en, value, suffix, order_index)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $content['id'], $body['labelAr'], $body['labelEn'], (int) $body['value'], $body['suffix'] ?? null, $orderIndex,
        ]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapStatItem(self::findStatItem($db, $id)), 201);
    }

    public static function updateStatItem(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findStatItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $db->prepare('UPDATE about_stat_items SET label_ar = ?, label_en = ?, value = ?, suffix = ? WHERE id = ?');
        $stmt->execute([
            $body['labelAr'] ?? $item['label_ar'],
            $body['labelEn'] ?? $item['label_en'],
            isset($body['value']) ? (int) $body['value'] : $item['value'],
            $body['suffix'] ?? $item['suffix'],
            $id,
        ]);

        Response::noContent();
    }

    public static function deleteStatItem(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findStatItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $stmt = $db->prepare('DELETE FROM about_stat_items WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function updateStatItemOrder(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $item = self::findStatItem($db, $id);
        if (!$item) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE about_stat_items SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $id]);

        Response::noContent();
    }
}
