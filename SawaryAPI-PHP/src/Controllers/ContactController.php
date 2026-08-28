<?php

class ContactController
{
    // Digits only, optional leading '+', 8–15 digits total (E.164-ish, not tied to one
    // specific country's format) — ported from the SawaryAPI/ .NET reference's PhoneRegex.
    private const PHONE_PATTERN = '/^\+?[0-9]{8,15}$/';

    private static function mapPhoneNumber(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'number' => $row['number'],
            'labelAr' => $row['label_ar'],
            'labelEn' => $row['label_en'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function mapSocialLink(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'platform' => $row['platform'],
            'url' => $row['url'],
            'orderIndex' => (int) $row['order_index'],
        ];
    }

    private static function mapSettings(array $row, array $phoneNumbers, array $socialLinks): array
    {
        return [
            'whatsAppNumber' => $row['whatsapp_number'],
            'email' => $row['email'],
            'phoneNumbers' => array_map([self::class, 'mapPhoneNumber'], $phoneNumbers),
            'socialLinks' => array_map([self::class, 'mapSocialLink'], $socialLinks),
        ];
    }

    // Self-initializing singleton. Production always has the seeded id=1 row from
    // migration_about_contact.sql; this is only a safety net.
    private static function getOrCreate(PDO $db): array
    {
        $stmt = $db->query('SELECT * FROM contact_settings ORDER BY id LIMIT 1');
        $row = $stmt->fetch();
        if ($row) {
            return $row;
        }

        $db->exec('INSERT INTO contact_settings () VALUES ()');
        $id = (int) $db->lastInsertId();

        $stmt = $db->prepare('SELECT * FROM contact_settings WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    private static function getPhoneNumbers(PDO $db, int $settingsId): array
    {
        $stmt = $db->prepare('SELECT * FROM contact_phone_numbers WHERE contact_settings_id = ? ORDER BY order_index');
        $stmt->execute([$settingsId]);
        return $stmt->fetchAll();
    }

    private static function getSocialLinks(PDO $db, int $settingsId): array
    {
        $stmt = $db->prepare('SELECT * FROM social_links WHERE contact_settings_id = ? ORDER BY order_index');
        $stmt->execute([$settingsId]);
        return $stmt->fetchAll();
    }

    private static function findPhoneNumber(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM contact_phone_numbers WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function findSocialLink(PDO $db, int $id): ?array
    {
        $stmt = $db->prepare('SELECT * FROM social_links WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private static function isValidUrl(string $url): bool
    {
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }
        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https'], true);
    }

    // ── Singleton settings ───────────────────────────────────────────────────

    public static function get(): void
    {
        $db = Database::get();
        $settings = self::getOrCreate($db);
        Response::json(self::mapSettings(
            $settings,
            self::getPhoneNumbers($db, (int) $settings['id']),
            self::getSocialLinks($db, (int) $settings['id'])
        ));
    }

    public static function update(): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $settings = self::getOrCreate($db);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $whatsAppNumber = $settings['whatsapp_number'];
        if (isset($body['whatsAppNumber'])) {
            if (!preg_match(self::PHONE_PATTERN, $body['whatsAppNumber'])) {
                Response::error('رقم واتساب غير صالح', 400);
            }
            $whatsAppNumber = $body['whatsAppNumber'];
        }

        $email = $settings['email'];
        if (isset($body['email'])) {
            if (filter_var($body['email'], FILTER_VALIDATE_EMAIL) === false) {
                Response::error('البريد الإلكتروني غير صالح', 400);
            }
            $email = $body['email'];
        }

        $stmt = $db->prepare('UPDATE contact_settings SET whatsapp_number = ?, email = ? WHERE id = ?');
        $stmt->execute([$whatsAppNumber, $email, (int) $settings['id']]);

        Response::noContent();
    }

    // ── Phone numbers ────────────────────────────────────────────────────────

    public static function createPhoneNumber(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['number']);

        if (!preg_match(self::PHONE_PATTERN, $body['number'])) {
            Response::error('رقم هاتف غير صالح', 400);
        }

        $db = Database::get();
        $settings = self::getOrCreate($db);

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM contact_phone_numbers WHERE contact_settings_id = ?');
        $stmt->execute([$settings['id']]);
        $orderIndex = (int) $stmt->fetchColumn() + 1;

        $stmt = $db->prepare('
            INSERT INTO contact_phone_numbers (contact_settings_id, number, label_ar, label_en, order_index)
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmt->execute([$settings['id'], $body['number'], $body['labelAr'] ?? null, $body['labelEn'] ?? null, $orderIndex]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapPhoneNumber(self::findPhoneNumber($db, $id)), 201);
    }

    public static function updatePhoneNumber(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $phone = self::findPhoneNumber($db, $id);
        if (!$phone) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $number = $phone['number'];
        if (isset($body['number'])) {
            if (!preg_match(self::PHONE_PATTERN, $body['number'])) {
                Response::error('رقم هاتف غير صالح', 400);
            }
            $number = $body['number'];
        }

        $stmt = $db->prepare('UPDATE contact_phone_numbers SET number = ?, label_ar = ?, label_en = ? WHERE id = ?');
        $stmt->execute([$number, $body['labelAr'] ?? $phone['label_ar'], $body['labelEn'] ?? $phone['label_en'], $id]);

        Response::noContent();
    }

    public static function deletePhoneNumber(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $phone = self::findPhoneNumber($db, $id);
        if (!$phone) {
            Response::error('Not Found', 404);
        }

        $stmt = $db->prepare('DELETE FROM contact_phone_numbers WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function updatePhoneNumberOrder(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $phone = self::findPhoneNumber($db, $id);
        if (!$phone) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE contact_phone_numbers SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $id]);

        Response::noContent();
    }

    // ── Social links ─────────────────────────────────────────────────────────

    public static function createSocialLink(): void
    {
        Auth::requireAuth();

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['platform', 'url']);

        if (!self::isValidUrl($body['url'])) {
            Response::error('الرابط غير صالح', 400);
        }

        $db = Database::get();
        $settings = self::getOrCreate($db);

        $stmt = $db->prepare('SELECT COALESCE(MAX(order_index), -1) FROM social_links WHERE contact_settings_id = ?');
        $stmt->execute([$settings['id']]);
        $orderIndex = (int) $stmt->fetchColumn() + 1;

        $stmt = $db->prepare('
            INSERT INTO social_links (contact_settings_id, platform, url, order_index)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$settings['id'], $body['platform'], $body['url'], $orderIndex]);

        $id = (int) $db->lastInsertId();
        Response::json(self::mapSocialLink(self::findSocialLink($db, $id)), 201);
    }

    public static function updateSocialLink(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $link = self::findSocialLink($db, $id);
        if (!$link) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $url = $link['url'];
        if (isset($body['url'])) {
            if (!self::isValidUrl($body['url'])) {
                Response::error('الرابط غير صالح', 400);
            }
            $url = $body['url'];
        }

        $stmt = $db->prepare('UPDATE social_links SET platform = ?, url = ? WHERE id = ?');
        $stmt->execute([$body['platform'] ?? $link['platform'], $url, $id]);

        Response::noContent();
    }

    public static function deleteSocialLink(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $link = self::findSocialLink($db, $id);
        if (!$link) {
            Response::error('Not Found', 404);
        }

        $stmt = $db->prepare('DELETE FROM social_links WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    public static function updateSocialLinkOrder(int $id): void
    {
        Auth::requireAuth();

        $db = Database::get();
        $link = self::findSocialLink($db, $id);
        if (!$link) {
            Response::error('Not Found', 404);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        Validation::requireFields($body, ['orderIndex']);

        $stmt = $db->prepare('UPDATE social_links SET order_index = ? WHERE id = ?');
        $stmt->execute([(int) $body['orderIndex'], $id]);

        Response::noContent();
    }
}
