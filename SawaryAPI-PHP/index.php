<?php

require __DIR__ . '/src/Database.php';
require __DIR__ . '/src/Response.php';
require __DIR__ . '/src/Jwt.php';
require __DIR__ . '/src/Auth.php';
require __DIR__ . '/src/Slug.php';
require __DIR__ . '/src/Validation.php';
require __DIR__ . '/src/Controllers/AuthController.php';
require __DIR__ . '/src/Controllers/CategoriesController.php';
require __DIR__ . '/src/Controllers/ProjectsController.php';
require __DIR__ . '/src/Controllers/ImagesController.php';
require __DIR__ . '/src/Controllers/ServiceSectionsController.php';
require __DIR__ . '/src/Controllers/ServiceCardsController.php';
require __DIR__ . '/src/Controllers/AboutController.php';
require __DIR__ . '/src/Controllers/ContactController.php';

Response::sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = array_values(array_filter(explode('/', trim($path, '/')), fn ($s) => $s !== ''));

// Allow the app to live in a sub-directory: drop leading segments until we hit "api".
while (!empty($segments) && $segments[0] !== 'api') {
    array_shift($segments);
}

$method = $_SERVER['REQUEST_METHOD'];

// segments[0] === 'api'
$resource = $segments[1] ?? null;
$id = $segments[2] ?? null;
$action = $segments[3] ?? null;

try {
    switch ($resource) {
        case 'auth':
            if ($method === 'POST' && $id === 'login') {
                AuthController::login();
                break;
            }
            Response::error('Not Found', 404);
            break;

        case 'categories':
            if ($method === 'GET' && $id === null) {
                CategoriesController::getAll();
            } elseif ($method === 'GET' && $id !== null) {
                ctype_digit($id) ? CategoriesController::getById((int) $id) : CategoriesController::getBySlug($id);
            } elseif ($method === 'POST' && $id === null) {
                CategoriesController::create();
            } elseif ($method === 'PUT' && $id !== null) {
                CategoriesController::update((int) $id);
            } elseif ($method === 'DELETE' && $id !== null) {
                CategoriesController::delete((int) $id);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'projects':
            if ($method === 'GET' && $id === null) {
                ProjectsController::getAll();
            } elseif ($method === 'GET' && $id !== null && $action === null) {
                ctype_digit($id) ? ProjectsController::getById((int) $id) : ProjectsController::getBySlug($id);
            } elseif ($method === 'POST' && $id === null) {
                ProjectsController::create();
            } elseif ($method === 'PUT' && $id !== null && $action === null) {
                ProjectsController::update((int) $id);
            } elseif ($method === 'DELETE' && $id !== null && $action === null) {
                ProjectsController::delete((int) $id);
            } elseif ($method === 'PATCH' && $id !== null && $action === 'featured') {
                ProjectsController::toggleFeatured((int) $id);
            } elseif ($method === 'PATCH' && $id !== null && $action === 'order') {
                ProjectsController::updateOrder((int) $id);
            } elseif ($method === 'POST' && $id !== null && $action === 'images') {
                ImagesController::upload((int) $id);
            } elseif ($method === 'PATCH' && $id !== null && $action === 'cover') {
                ImagesController::setCover((int) $id);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'images':
            if ($method === 'DELETE' && $id !== null && $action === null) {
                ImagesController::delete((int) $id);
            } elseif ($method === 'PATCH' && $id !== null && $action === 'order') {
                ImagesController::updateOrder((int) $id);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'service-sections':
            if ($method === 'GET' && $id === null) {
                ServiceSectionsController::getAll();
            } elseif ($method === 'GET' && $id !== null && $action === null) {
                ctype_digit($id) ? ServiceSectionsController::getById((int) $id) : ServiceSectionsController::getBySlug($id);
            } elseif ($method === 'POST' && $id === null) {
                ServiceSectionsController::create();
            } elseif ($method === 'PUT' && $id !== null && $action === null) {
                ServiceSectionsController::update((int) $id);
            } elseif ($method === 'DELETE' && $id !== null && $action === null) {
                ServiceSectionsController::delete((int) $id);
            } elseif ($method === 'POST' && $id !== null && $action === 'hero') {
                ServiceSectionsController::uploadHero((int) $id);
            } elseif ($method === 'POST' && $id !== null && $action === 'cards') {
                ServiceCardsController::create((int) $id);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'service-cards':
            if ($method === 'PUT' && $id !== null && $action === null) {
                ServiceCardsController::update((int) $id);
            } elseif ($method === 'DELETE' && $id !== null && $action === null) {
                ServiceCardsController::delete((int) $id);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'about':
            if ($method === 'GET' && $id === null) {
                AboutController::get();
            } elseif ($method === 'PUT' && $id === null) {
                AboutController::update();
            } elseif ($method === 'POST' && $id === 'team-photo') {
                AboutController::uploadTeamPhoto();
            } elseif ($method === 'POST' && $id === 'faq-items' && $action === null) {
                AboutController::createFaqItem();
            } elseif ($method === 'PUT' && $id === 'faq-items' && $action !== null) {
                AboutController::updateFaqItem((int) $action);
            } elseif ($method === 'DELETE' && $id === 'faq-items' && $action !== null) {
                AboutController::deleteFaqItem((int) $action);
            } elseif ($method === 'PATCH' && $id === 'faq-items' && $action !== null && ($segments[4] ?? null) === 'order') {
                AboutController::updateFaqItemOrder((int) $action);
            } elseif ($method === 'POST' && $id === 'stat-items' && $action === null) {
                AboutController::createStatItem();
            } elseif ($method === 'PUT' && $id === 'stat-items' && $action !== null) {
                AboutController::updateStatItem((int) $action);
            } elseif ($method === 'DELETE' && $id === 'stat-items' && $action !== null) {
                AboutController::deleteStatItem((int) $action);
            } elseif ($method === 'PATCH' && $id === 'stat-items' && $action !== null && ($segments[4] ?? null) === 'order') {
                AboutController::updateStatItemOrder((int) $action);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        case 'contact-settings':
            if ($method === 'GET' && $id === null) {
                ContactController::get();
            } elseif ($method === 'PUT' && $id === null) {
                ContactController::update();
            } elseif ($method === 'POST' && $id === 'phone-numbers' && $action === null) {
                ContactController::createPhoneNumber();
            } elseif ($method === 'PUT' && $id === 'phone-numbers' && $action !== null) {
                ContactController::updatePhoneNumber((int) $action);
            } elseif ($method === 'DELETE' && $id === 'phone-numbers' && $action !== null) {
                ContactController::deletePhoneNumber((int) $action);
            } elseif ($method === 'PATCH' && $id === 'phone-numbers' && $action !== null && ($segments[4] ?? null) === 'order') {
                ContactController::updatePhoneNumberOrder((int) $action);
            } elseif ($method === 'POST' && $id === 'social-links' && $action === null) {
                ContactController::createSocialLink();
            } elseif ($method === 'PUT' && $id === 'social-links' && $action !== null) {
                ContactController::updateSocialLink((int) $action);
            } elseif ($method === 'DELETE' && $id === 'social-links' && $action !== null) {
                ContactController::deleteSocialLink((int) $action);
            } elseif ($method === 'PATCH' && $id === 'social-links' && $action !== null && ($segments[4] ?? null) === 'order') {
                ContactController::updateSocialLinkOrder((int) $action);
            } else {
                Response::error('Not Found', 404);
            }
            break;

        default:
            Response::error('Not Found', 404);
    }
} catch (Throwable $e) {
    Response::error('Internal Server Error: ' . $e->getMessage(), 500);
}
