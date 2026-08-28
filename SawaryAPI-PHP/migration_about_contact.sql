-- Run this against the existing production database that predates the About/Contact
-- system. Adds about_content, about_faq_items, about_stat_items, contact_settings,
-- contact_phone_numbers and social_links, then seeds them with the site's current real
-- copy (transplanted verbatim from sawaryfrontend/lib/about.ts and lib/contact.ts's
-- FALLBACK constants) so the public site shows no regression the moment this ships.
-- Safe to re-run: table creation uses CREATE TABLE IF NOT EXISTS, and every seed row uses
-- an explicit id + ON DUPLICATE KEY UPDATE id = id, which no-ops if the row already
-- exists — so re-running this file never clobbers content an admin has since edited
-- through /admin/about or /admin/contact.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS about_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hero_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    hero_title_en VARCHAR(255) NOT NULL DEFAULT '',
    hero_statement_ar TEXT NOT NULL,
    hero_statement_en TEXT NOT NULL,
    hero_scroll_hint_ar VARCHAR(100) NOT NULL DEFAULT '',
    hero_scroll_hint_en VARCHAR(100) NOT NULL DEFAULT '',
    vision_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    vision_title_en VARCHAR(255) NOT NULL DEFAULT '',
    vision_body_ar TEXT NOT NULL,
    vision_body_en TEXT NOT NULL,
    team_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    team_title_en VARCHAR(255) NOT NULL DEFAULT '',
    team_image_alt_ar VARCHAR(255) NOT NULL DEFAULT '',
    team_image_alt_en VARCHAR(255) NOT NULL DEFAULT '',
    team_photo_url VARCHAR(500) NOT NULL DEFAULT '',
    team_photo_public_id VARCHAR(255) NULL,
    team_photo_width INT NULL,
    team_photo_height INT NULL,
    faq_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    faq_title_en VARCHAR(255) NOT NULL DEFAULT '',
    location_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    location_title_en VARCHAR(255) NOT NULL DEFAULT '',
    location_address_ar VARCHAR(500) NOT NULL DEFAULT '',
    location_address_en VARCHAR(500) NOT NULL DEFAULT '',
    location_map_title_ar VARCHAR(255) NOT NULL DEFAULT '',
    location_map_title_en VARCHAR(255) NOT NULL DEFAULT '',
    location_map_coming_soon_ar VARCHAR(255) NOT NULL DEFAULT '',
    location_map_coming_soon_en VARCHAR(255) NOT NULL DEFAULT '',
    location_gallery_alt_ar VARCHAR(255) NOT NULL DEFAULT '',
    location_gallery_alt_en VARCHAR(255) NOT NULL DEFAULT '',
    section_label_who_we_are_ar VARCHAR(255) NOT NULL DEFAULT '',
    section_label_who_we_are_en VARCHAR(255) NOT NULL DEFAULT '',
    section_label_team_structure_ar VARCHAR(255) NOT NULL DEFAULT '',
    section_label_team_structure_en VARCHAR(255) NOT NULL DEFAULT '',
    section_label_faq_ar VARCHAR(255) NOT NULL DEFAULT '',
    section_label_faq_en VARCHAR(255) NOT NULL DEFAULT '',
    section_label_visit_us_ar VARCHAR(255) NOT NULL DEFAULT '',
    section_label_visit_us_en VARCHAR(255) NOT NULL DEFAULT '',
    section_label_stats_ar VARCHAR(255) NOT NULL DEFAULT '',
    section_label_stats_en VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS about_faq_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    about_content_id INT NOT NULL,
    question_ar VARCHAR(500) NOT NULL DEFAULT '',
    question_en VARCHAR(500) NOT NULL DEFAULT '',
    answer_ar TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    action_label_ar VARCHAR(255) NULL,
    action_label_en VARCHAR(255) NULL,
    action_href VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 0,
    KEY ix_about_faq_items_about_content_id (about_content_id),
    CONSTRAINT fk_about_faq_items_about_content FOREIGN KEY (about_content_id) REFERENCES about_content (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS about_stat_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    about_content_id INT NOT NULL,
    label_ar VARCHAR(255) NOT NULL DEFAULT '',
    label_en VARCHAR(255) NOT NULL DEFAULT '',
    value INT NOT NULL DEFAULT 0,
    suffix VARCHAR(50) NULL,
    order_index INT NOT NULL DEFAULT 0,
    KEY ix_about_stat_items_about_content_id (about_content_id),
    CONSTRAINT fk_about_stat_items_about_content FOREIGN KEY (about_content_id) REFERENCES about_content (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    whatsapp_number VARCHAR(20) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_phone_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_settings_id INT NOT NULL,
    number VARCHAR(20) NOT NULL DEFAULT '',
    label_ar VARCHAR(255) NULL,
    label_en VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 0,
    KEY ix_contact_phone_numbers_contact_settings_id (contact_settings_id),
    CONSTRAINT fk_contact_phone_numbers_contact_settings FOREIGN KEY (contact_settings_id) REFERENCES contact_settings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_settings_id INT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT '',
    url VARCHAR(500) NOT NULL DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    KEY ix_social_links_contact_settings_id (contact_settings_id),
    CONSTRAINT fk_social_links_contact_settings FOREIGN KEY (contact_settings_id) REFERENCES contact_settings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data — real content transplanted from lib/about.ts / lib/contact.ts's FALLBACK.
-- Explicit ids + ON DUPLICATE KEY UPDATE id=id make every insert below idempotent.

INSERT INTO about_content (
    id, hero_title_ar, hero_title_en, hero_statement_ar, hero_statement_en,
    hero_scroll_hint_ar, hero_scroll_hint_en, vision_title_ar, vision_title_en,
    vision_body_ar, vision_body_en, team_title_ar, team_title_en,
    team_image_alt_ar, team_image_alt_en, team_photo_url, team_photo_public_id,
    team_photo_width, team_photo_height, faq_title_ar, faq_title_en,
    location_title_ar, location_title_en, location_address_ar, location_address_en,
    location_map_title_ar, location_map_title_en, location_map_coming_soon_ar, location_map_coming_soon_en,
    location_gallery_alt_ar, location_gallery_alt_en,
    section_label_who_we_are_ar, section_label_who_we_are_en,
    section_label_team_structure_ar, section_label_team_structure_en,
    section_label_faq_ar, section_label_faq_en,
    section_label_visit_us_ar, section_label_visit_us_en,
    section_label_stats_ar, section_label_stats_en
) VALUES (
    1, 'في ســـواري', 'At Sawary',
    'نَنحَت الفراغات بفنّيّة عالية، لِنُقَـدِّم تجارب بصرية تَجمَع بين أصالة الثقافة العربية ورُوح التصميم المُعاصِر، من السعودية نَنطَلِق بروح تنافسية لتحقيق العالمية، في كُلّ تفصيل نَصنَعه هو احتفاء بالهُوِيّة، وكُلّ مشروع نُنَفِّذُه هو قصة تُروَى بَدأَتْها سَوَارِي.',
    'We carve spaces with great artistry to deliver visual experiences that blend the authenticity of Arab culture with the spirit of contemporary design. From Saudi Arabia, we set out with a competitive spirit to reach the world. Every detail we craft is a celebration of identity, and every project we execute is a story whose telling Sawary began.',
    'مرر', 'Scroll',
    'رؤيتنا', 'Our Vision',
    'كما بَدأنا بتغيير المفاهيم في التَّصميم الدَّاخلي خاصَّة، نسعى لتحسين وإحداث ثورة في عالم التَّصميم والبناء عامَّة، لنحقِّق تجربة فريدة ترتقي بذائقة عملائنا من النُّخبة المختارة بعناية.',
    'Just as we began by changing the concepts of interior design specifically, we strive to improve and revolutionize the world of design and construction in general — delivering a unique experience that elevates the taste of our carefully chosen, elite clients.',
    'الفريـــق', 'The Team',
    'هيكلية فريق سواري', 'Sawary team structure',
    '/images/about/employeStrucure.webp', NULL, 2800, 1575,
    'الأسئلة الشائعة', 'Frequently Asked Questions',
    'موقعنا', 'Our Location',
    '8694 شارع خالد بن الوليد - حي الروضة - الرياض', '8694 Khalid bin Al-Walid St - Al Rawdah Dist. - Riyadh',
    'موقع سواري على الخريطة', 'Sawary location on the map',
    'الخريطة قريباً', 'Map coming soon',
    'مقر سواري', 'Sawary headquarters',
    'من نحن', 'Who We Are',
    'هيكل المنظومة', 'Team Structure',
    'استفساراتكم', 'Inquiries',
    'زورونا', 'Visit Us',
    'بالأرقام', 'By The Numbers'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO about_faq_items (id, about_content_id, order_index, question_ar, question_en, answer_ar, answer_en, action_label_ar, action_label_en, action_href) VALUES
(1, 1, 0, 'الخدمات؟', 'Services?', 'نقدم التصميم الداخلي والخارجي ثلاثي الأبعاد وأيضاً التشطيبات والأثاث بشكل كامل.', 'We provide 3D interior and exterior design, as well as complete finishing and furniture.', NULL, NULL, NULL),
(2, 1, 1, 'العملاء؟', 'Clients?', 'نستقبل جميع العملاء ونصمم وننفذ المشاريع السكنية والتجارية وغيرها.', 'We welcome all clients and design and execute residential, commercial, and other projects.', 'رحلة العميل', 'Client Journey', '/services'),
(3, 1, 2, 'المدة؟', 'Duration?', 'كل مشروع له خطة عمل مدروسة ونحدد المدة الزمنية حسب المتطلبات والمواعيد، ولكن عادةً ما تكون المدة المعتادة لمشاريع التصميم 45 يوم عمل.', 'Every project has a carefully studied work plan, and we set the timeline based on requirements and deadlines — though design projects typically take around 45 working days.', NULL, NULL, NULL),
(4, 1, 3, 'نوع المواد؟', 'Materials?', 'نتميز بقدرة على توفير كل من المواد الطبيعية والصناعية ونستخدمها بشكل مناسب لكل مشروع وبجودة عالية تليق بسواري.', 'We are able to provide both natural and synthetic materials, using them appropriately for each project with the high quality befitting Sawary.', NULL, NULL, NULL),
(5, 1, 4, 'التواصل؟', 'Contact?', 'التواصل عبر الهاتف لخدمة العملاء أو عن طريق البريد الإلكتروني.', 'Reach us by phone for customer service or by email.', 'احجز استشارتك المجانية', 'Book Your Free Consultation', '/contact')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO about_stat_items (id, about_content_id, order_index, label_ar, label_en, value, suffix) VALUES
(1, 1, 0, 'عاماً من الخبرة', 'Years of Experience', 12, '+'),
(2, 1, 1, 'مشروع منجز', 'Completed Projects', 500, '+'),
(3, 1, 2, 'عميل راضٍ', 'Satisfied Clients', 7000, '+')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO contact_settings (id, whatsapp_number, email)
VALUES (1, '966500175000', 'sawarydecor@gmail.com')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO contact_phone_numbers (id, contact_settings_id, order_index, number, label_ar, label_en)
VALUES (1, 1, 0, '+966500175000', NULL, NULL)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO social_links (id, contact_settings_id, order_index, platform, url) VALUES
(1, 1, 0, 'instagram', 'https://www.instagram.com/sawary.de/'),
(2, 1, 1, 'x', 'https://x.com/SawaryDe'),
(3, 1, 2, 'youtube', 'https://www.youtube.com/@SAWARYDE'),
(4, 1, 3, 'pinterest', 'https://www.pinterest.com/sawarydecorproject/'),
(5, 1, 4, 'tiktok', 'https://www.tiktok.com/@sawary.de')
ON DUPLICATE KEY UPDATE id = id;
