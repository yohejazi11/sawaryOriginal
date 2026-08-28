<?php

class Slug
{
    public static function slugify(string $name): string
    {
        $slug = mb_strtolower(trim($name));
        $slug = preg_replace('/\s+/u', '-', $slug);
        $slug = preg_replace('/[^a-z0-9-]/u', '', $slug);
        $slug = trim(preg_replace('/-+/', '-', $slug), '-');

        if ($slug === '') {
            $slug = substr(bin2hex(random_bytes(4)), 0, 8);
        }

        return $slug;
    }

    public static function uniqueSlug(PDO $db, string $table, string $name): string
    {
        $baseSlug = self::slugify($name);
        $slug = $baseSlug;
        $suffix = 2;

        $stmt = $db->prepare("SELECT COUNT(*) FROM {$table} WHERE slug = ?");

        while (true) {
            $stmt->execute([$slug]);
            if ((int) $stmt->fetchColumn() === 0) {
                return $slug;
            }
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }
    }
}
