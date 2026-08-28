<?php

class Response
{
    public static function sendCorsHeaders(): void
    {
        $config = require __DIR__ . '/../config.php';
        $allowedOrigins = $config['allowed_origins'] ?? [];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Vary: Origin');
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['message' => $message], $status);
    }

    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }
}
