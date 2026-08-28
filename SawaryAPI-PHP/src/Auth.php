<?php

class Auth
{
    public static function requireAuth(): array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            Response::error('Unauthorized', 401);
        }

        $config = require __DIR__ . '/../config.php';
        $payload = Jwt::decode($matches[1], $config['jwt']['key']);

        if ($payload === null) {
            Response::error('Unauthorized', 401);
        }

        return $payload;
    }
}
