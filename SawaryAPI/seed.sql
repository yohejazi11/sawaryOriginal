-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO Categories (Name, Slug, Type, OrderIndex) VALUES
  (N'تنفيذ تجاري',  'commercial',  'execution', 1),
  (N'تنفيذ سكني',   'residential', 'execution', 2),
  (N'تصميم',        'design',      'design',    3);

-- ── Projects ──────────────────────────────────────────────────────────────────
-- Commercial (CategoryId = 1)
INSERT INTO Projects (Name, Slug, Description, Location, Year, IsFeatured, OrderIndex, CreatedAt, CategoryId, CoverImageUrl) VALUES
(
  N'مجمع الواحة التجاري', 'oasis-complex',
  N'مشروع تجاري راقٍ يقع في قلب العاصمة الرياض، يجمع بين الوظيفة والجمال في تصميم معاصر يعكس هوية سواري. تضمّن المشروع تنفيذ مساحات متعددة الاستخدام تشمل مكاتب ومحلات تجارية وفضاءات مفتوحة.',
  N'الرياض', '2024', 1, 1, GETUTCDATE(), 1,
  'https://picsum.photos/seed/oasis-cover/1920/1080'
),
(
  N'برج الأعمال', 'business-tower',
  N'برج مكتبي متعدد الطوابق يوفر بيئة عمل احترافية راقية في موقع استراتيجي وسط المدينة، مع واجهات زجاجية حديثة وأنظمة ذكية متكاملة.',
  N'الرياض', '2023', 1, 2, GETUTCDATE(), 1,
  'https://picsum.photos/seed/tower-cover/1920/1080'
),
(
  N'فندق النخيل', 'palm-hotel',
  N'فندق فاخر ذو خمسة نجوم يقدم تجربة ضيافة استثنائية بتصميم داخلي مستوحى من التراث العربي الأصيل مع لمسات عصرية راقية.',
  N'جدة', '2023', 0, 3, GETUTCDATE(), 1,
  'https://picsum.photos/seed/hotel-cover/1920/1080'
),
(
  N'مركز الرياض للتسوق', 'riyadh-mall',
  N'مركز تسوق ضخم يمتد على مساحة شاسعة يضم أكثر من 300 محل تجاري وفضاءات للترفيه والمطاعم في تصميم معماري جذاب.',
  N'الرياض', '2022', 0, 4, GETUTCDATE(), 1,
  'https://picsum.photos/seed/mall-cover/1920/1080'
);

-- Residential (CategoryId = 2)
INSERT INTO Projects (Name, Slug, Description, Location, Year, IsFeatured, OrderIndex, CreatedAt, CategoryId, CoverImageUrl) VALUES
(
  N'فيلا النخيل', 'palm-villa',
  N'فيلا سكنية فاخرة تمتد على مساحة شاسعة تطلّ على البحر الأحمر. صُمِّمت كل مفردة في هذا المشروع لتحكي قصة الترف والإتقان، من المواد الخام المختارة بعناية إلى التفاصيل الدقيقة.',
  N'جدة', '2024', 1, 1, GETUTCDATE(), 2,
  'https://picsum.photos/seed/palm-cover/1920/1080'
),
(
  N'شقق الأندلس', 'andalus-apartments',
  N'مجمع سكني راقٍ يضم 48 شقة فاخرة بمساحات متنوعة، مصمم بعناية فائقة لتوفير أعلى مستويات الراحة والخصوصية لساكنيه.',
  N'الدمام', '2023', 0, 2, GETUTCDATE(), 2,
  'https://picsum.photos/seed/andalus-cover/1920/1080'
),
(
  N'قصر الغروب', 'sunset-palace',
  N'قصر سكني فخم يجمع بين العمارة الكلاسيكية والتصميم الحديث على مساحة 2000 متر مربع، مع حدائق منسقة وحمام سباحة خاص.',
  N'الرياض', '2022', 1, 3, GETUTCDATE(), 2,
  'https://picsum.photos/seed/palace-cover/1920/1080'
);

-- Design (CategoryId = 3)
INSERT INTO Projects (Name, Slug, Description, Location, Year, IsFeatured, OrderIndex, CreatedAt, CategoryId, CoverImageUrl) VALUES
(
  N'برج العاصمة', 'capital-tower',
  N'تصميم داخلي متكامل لبرج مكتبي شاهق يرتكز على مبدأ الانسيابية والضوء الطبيعي. استُلهمت الفكرة من ملامح الصحراء العربية؛ خطوط ناعمة تتقاطع مع حدة هندسية مدروسة.',
  N'أبوظبي', '2024', 1, 1, GETUTCDATE(), 3,
  'https://picsum.photos/seed/capital-cover/1920/1080'
),
(
  N'تصميم فيلا الرياض', 'riyadh-villa-design',
  N'تصميم داخلي متكامل لفيلا فاخرة تمزج بين الفخامة الشرقية الأصيلة والمعاصرة الراقية في كل تفصيلة وركن من أركان الفضاء.',
  N'الرياض', '2023', 0, 2, GETUTCDATE(), 3,
  'https://picsum.photos/seed/villa-design-cover/1920/1080'
),
(
  N'ديكور مطعم الواجهة', 'waterfront-restaurant',
  N'تصميم وديكور مطعم فاخر مطل على الواجهة البحرية بمساحة 800 متر، يجمع بين أجواء البحر الرومانسية والأناقة المعاصرة.',
  N'جدة', '2023', 0, 3, GETUTCDATE(), 3,
  'https://picsum.photos/seed/restaurant-cover/1920/1080'
);

-- ── Project Images ─────────────────────────────────────────────────────────────
-- Declare project IDs dynamically
DECLARE @oasis     INT = (SELECT Id FROM Projects WHERE Slug = 'oasis-complex')
DECLARE @bizTower  INT = (SELECT Id FROM Projects WHERE Slug = 'business-tower')
DECLARE @hotel     INT = (SELECT Id FROM Projects WHERE Slug = 'palm-hotel')
DECLARE @mall      INT = (SELECT Id FROM Projects WHERE Slug = 'riyadh-mall')
DECLARE @villa     INT = (SELECT Id FROM Projects WHERE Slug = 'palm-villa')
DECLARE @apts      INT = (SELECT Id FROM Projects WHERE Slug = 'andalus-apartments')
DECLARE @palace    INT = (SELECT Id FROM Projects WHERE Slug = 'sunset-palace')
DECLARE @capTower  INT = (SELECT Id FROM Projects WHERE Slug = 'capital-tower')
DECLARE @villaD    INT = (SELECT Id FROM Projects WHERE Slug = 'riyadh-villa-design')
DECLARE @resto     INT = (SELECT Id FROM Projects WHERE Slug = 'waterfront-restaurant')

-- oasis-complex: 9 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/oasis01/1920/1080', '', 0, @oasis),
  ('https://picsum.photos/seed/oasis02/1920/1080', '', 1, @oasis),
  ('https://picsum.photos/seed/oasis03/1920/1080', '', 2, @oasis),
  ('https://picsum.photos/seed/oasis04/1920/1080', '', 3, @oasis),
  ('https://picsum.photos/seed/oasis05/1920/1080', '', 4, @oasis),
  ('https://picsum.photos/seed/oasis06/1920/1080', '', 5, @oasis),
  ('https://picsum.photos/seed/oasis07/1920/1080', '', 6, @oasis),
  ('https://picsum.photos/seed/oasis08/1920/1080', '', 7, @oasis),
  ('https://picsum.photos/seed/oasis09/1920/1080', '', 8, @oasis);

-- business-tower: 8 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/btower01/1920/1080', '', 0, @bizTower),
  ('https://picsum.photos/seed/btower02/1920/1080', '', 1, @bizTower),
  ('https://picsum.photos/seed/btower03/1920/1080', '', 2, @bizTower),
  ('https://picsum.photos/seed/btower04/1920/1080', '', 3, @bizTower),
  ('https://picsum.photos/seed/btower05/1920/1080', '', 4, @bizTower),
  ('https://picsum.photos/seed/btower06/1920/1080', '', 5, @bizTower),
  ('https://picsum.photos/seed/btower07/1920/1080', '', 6, @bizTower),
  ('https://picsum.photos/seed/btower08/1920/1080', '', 7, @bizTower);

-- palm-hotel: 8 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/hotel01/1920/1080', '', 0, @hotel),
  ('https://picsum.photos/seed/hotel02/1920/1080', '', 1, @hotel),
  ('https://picsum.photos/seed/hotel03/1920/1080', '', 2, @hotel),
  ('https://picsum.photos/seed/hotel04/1920/1080', '', 3, @hotel),
  ('https://picsum.photos/seed/hotel05/1920/1080', '', 4, @hotel),
  ('https://picsum.photos/seed/hotel06/1920/1080', '', 5, @hotel),
  ('https://picsum.photos/seed/hotel07/1920/1080', '', 6, @hotel),
  ('https://picsum.photos/seed/hotel08/1920/1080', '', 7, @hotel);

-- riyadh-mall: 6 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/mall01/1920/1080', '', 0, @mall),
  ('https://picsum.photos/seed/mall02/1920/1080', '', 1, @mall),
  ('https://picsum.photos/seed/mall03/1920/1080', '', 2, @mall),
  ('https://picsum.photos/seed/mall04/1920/1080', '', 3, @mall),
  ('https://picsum.photos/seed/mall05/1920/1080', '', 4, @mall),
  ('https://picsum.photos/seed/mall06/1920/1080', '', 5, @mall);

-- palm-villa: 10 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/palm01/1920/1080', '', 0, @villa),
  ('https://picsum.photos/seed/palm02/1920/1080', '', 1, @villa),
  ('https://picsum.photos/seed/palm03/1920/1080', '', 2, @villa),
  ('https://picsum.photos/seed/palm04/1920/1080', '', 3, @villa),
  ('https://picsum.photos/seed/palm05/1920/1080', '', 4, @villa),
  ('https://picsum.photos/seed/palm06/1920/1080', '', 5, @villa),
  ('https://picsum.photos/seed/palm07/1920/1080', '', 6, @villa),
  ('https://picsum.photos/seed/palm08/1920/1080', '', 7, @villa),
  ('https://picsum.photos/seed/palm09/1920/1080', '', 8, @villa),
  ('https://picsum.photos/seed/palm10/1920/1080', '', 9, @villa);

-- andalus-apartments: 7 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/andalus01/1920/1080', '', 0, @apts),
  ('https://picsum.photos/seed/andalus02/1920/1080', '', 1, @apts),
  ('https://picsum.photos/seed/andalus03/1920/1080', '', 2, @apts),
  ('https://picsum.photos/seed/andalus04/1920/1080', '', 3, @apts),
  ('https://picsum.photos/seed/andalus05/1920/1080', '', 4, @apts),
  ('https://picsum.photos/seed/andalus06/1920/1080', '', 5, @apts),
  ('https://picsum.photos/seed/andalus07/1920/1080', '', 6, @apts);

-- sunset-palace: 8 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/palace01/1920/1080', '', 0, @palace),
  ('https://picsum.photos/seed/palace02/1920/1080', '', 1, @palace),
  ('https://picsum.photos/seed/palace03/1920/1080', '', 2, @palace),
  ('https://picsum.photos/seed/palace04/1920/1080', '', 3, @palace),
  ('https://picsum.photos/seed/palace05/1920/1080', '', 4, @palace),
  ('https://picsum.photos/seed/palace06/1920/1080', '', 5, @palace),
  ('https://picsum.photos/seed/palace07/1920/1080', '', 6, @palace),
  ('https://picsum.photos/seed/palace08/1920/1080', '', 7, @palace);

-- capital-tower: 8 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/tower01/1920/1080', '', 0, @capTower),
  ('https://picsum.photos/seed/tower02/1920/1080', '', 1, @capTower),
  ('https://picsum.photos/seed/tower03/1920/1080', '', 2, @capTower),
  ('https://picsum.photos/seed/tower04/1920/1080', '', 3, @capTower),
  ('https://picsum.photos/seed/tower05/1920/1080', '', 4, @capTower),
  ('https://picsum.photos/seed/tower06/1920/1080', '', 5, @capTower),
  ('https://picsum.photos/seed/tower07/1920/1080', '', 6, @capTower),
  ('https://picsum.photos/seed/tower08/1920/1080', '', 7, @capTower);

-- riyadh-villa-design: 8 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/villaD01/1920/1080', '', 0, @villaD),
  ('https://picsum.photos/seed/villaD02/1920/1080', '', 1, @villaD),
  ('https://picsum.photos/seed/villaD03/1920/1080', '', 2, @villaD),
  ('https://picsum.photos/seed/villaD04/1920/1080', '', 3, @villaD),
  ('https://picsum.photos/seed/villaD05/1920/1080', '', 4, @villaD),
  ('https://picsum.photos/seed/villaD06/1920/1080', '', 5, @villaD),
  ('https://picsum.photos/seed/villaD07/1920/1080', '', 6, @villaD),
  ('https://picsum.photos/seed/villaD08/1920/1080', '', 7, @villaD);

-- waterfront-restaurant: 6 images
INSERT INTO ProjectImages (Url, PublicId, OrderIndex, ProjectId) VALUES
  ('https://picsum.photos/seed/resto01/1920/1080', '', 0, @resto),
  ('https://picsum.photos/seed/resto02/1920/1080', '', 1, @resto),
  ('https://picsum.photos/seed/resto03/1920/1080', '', 2, @resto),
  ('https://picsum.photos/seed/resto04/1920/1080', '', 3, @resto),
  ('https://picsum.photos/seed/resto05/1920/1080', '', 4, @resto),
  ('https://picsum.photos/seed/resto06/1920/1080', '', 5, @resto);

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  c.Name   AS Category,
  COUNT(p.Id) AS Projects,
  SUM(img.ImgCount) AS TotalImages
FROM Categories c
LEFT JOIN Projects p ON p.CategoryId = c.Id
LEFT JOIN (
  SELECT ProjectId, COUNT(*) AS ImgCount
  FROM ProjectImages
  GROUP BY ProjectId
) img ON img.ProjectId = p.Id
GROUP BY c.Name
ORDER BY c.Name;
