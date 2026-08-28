<?php

class Validation
{
    /**
     * Mimics ASP.NET Core's default [ApiController] model-validation 400 response shape:
     * {"errors": {"Field": ["The Field field is required."]}, "title": "...", "status": 400}
     */
    public static function requireFields(array $body, array $fields): void
    {
        $errors = [];

        foreach ($fields as $field) {
            $value = $body[$field] ?? null;
            if ($value === null || (is_string($value) && trim($value) === '')) {
                $errors[$field] = ["The {$field} field is required."];
            }
        }

        if (!empty($errors)) {
            Response::json([
                'errors' => $errors,
                'title' => 'One or more validation errors occurred.',
                'status' => 400,
            ], 400);
        }
    }
}
