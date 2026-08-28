-- Run this against an existing database that predates the Services system.
-- Adds the service_sections and service_cards tables (safe to re-run).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS service_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT NULL,
    hero_image_url VARCHAR(500) NOT NULL DEFAULT '',
    hero_image_public_id VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_service_sections_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image_url VARCHAR(500) NOT NULL DEFAULT '',
    public_id VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 0,
    section_id INT NOT NULL,
    KEY ix_service_cards_section_id (section_id),
    CONSTRAINT fk_service_cards_section FOREIGN KEY (section_id) REFERENCES service_sections (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
