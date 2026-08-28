<?php

class AuthController
{
    public static function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        Validation::requireFields($body, ['username', 'password']);

        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM admin_users WHERE username = ?');
        $stmt->execute([$body['username']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            Response::error('بيانات الدخول غير صحيحة', 401);
        }

        $config = require __DIR__ . '/../../config.php';
        $jwtConfig = $config['jwt'];

        $expiresAt = time() + ($jwtConfig['expire_hours'] * 3600);

        $payload = [
            'sub' => (string) $user['id'],
            'unique_name' => $user['username'],
            'jti' => bin2hex(random_bytes(16)),
            'iss' => $jwtConfig['issuer'],
            'aud' => $jwtConfig['audience'],
            'exp' => $expiresAt,
        ];

        $token = Jwt::encode($payload, $jwtConfig['key']);

        Response::json([
            'token' => $token,
            'username' => $user['username'],
            'expiresAt' => gmdate('Y-m-d\TH:i:s.000\Z', $expiresAt),
        ]);
    }
}
