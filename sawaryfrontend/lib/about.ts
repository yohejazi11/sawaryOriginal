const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export interface AboutFaqItem {
  id: number
  questionAr: string
  questionEn: string
  answerAr: string
  answerEn: string
  actionLabelAr: string | null
  actionLabelEn: string | null
  actionHref: string | null
  orderIndex: number
}

export interface AboutStatItem {
  id: number
  labelAr: string
  labelEn: string
  value: number
  suffix: string | null
  orderIndex: number
}

export interface AboutContent {
  heroTitleAr: string
  heroTitleEn: string
  heroStatementAr: string
  heroStatementEn: string
  heroScrollHintAr: string
  heroScrollHintEn: string
  visionTitleAr: string
  visionTitleEn: string
  visionBodyAr: string
  visionBodyEn: string
  teamTitleAr: string
  teamTitleEn: string
  teamImageAltAr: string
  teamImageAltEn: string
  teamPhotoUrl: string
  teamPhotoWidth: number | null
  teamPhotoHeight: number | null
  faqTitleAr: string
  faqTitleEn: string
  locationTitleAr: string
  locationTitleEn: string
  locationAddressAr: string
  locationAddressEn: string
  locationMapTitleAr: string
  locationMapTitleEn: string
  locationMapComingSoonAr: string
  locationMapComingSoonEn: string
  locationGalleryAltAr: string
  locationGalleryAltEn: string
  sectionLabelWhoWeAreAr: string
  sectionLabelWhoWeAreEn: string
  sectionLabelTeamStructureAr: string
  sectionLabelTeamStructureEn: string
  sectionLabelFaqAr: string
  sectionLabelFaqEn: string
  sectionLabelVisitUsAr: string
  sectionLabelVisitUsEn: string
  sectionLabelStatsAr: string
  sectionLabelStatsEn: string
  faqItems: AboutFaqItem[]
  statItems: AboutStatItem[]
}

// Static fallback — used only if the API is unreachable, so the page degrades to the
// last-known-good copy instead of crashing or rendering blank. Kept in sync with the
// seed data in SawaryAPI/Data/AppDbContext.cs at the time this feature shipped; the
// database is the actual source of truth going forward.
const FALLBACK: AboutContent = {
  heroTitleAr: 'في ســـواري',
  heroTitleEn: 'At Sawary',
  heroStatementAr: 'نَنحَت الفراغات بفنّيّة عالية، لِنُقَـدِّم تجارب بصرية تَجمَع بين أصالة الثقافة العربية ورُوح التصميم المُعاصِر، من السعودية نَنطَلِق بروح تنافسية لتحقيق العالمية، في كُلّ تفصيل نَصنَعه هو احتفاء بالهُوِيّة، وكُلّ مشروع نُنَفِّذُه هو قصة تُروَى بَدأَتْها سَوَارِي.',
  heroStatementEn: 'We carve spaces with great artistry to deliver visual experiences that blend the authenticity of Arab culture with the spirit of contemporary design. From Saudi Arabia, we set out with a competitive spirit to reach the world. Every detail we craft is a celebration of identity, and every project we execute is a story whose telling Sawary began.',
  heroScrollHintAr: 'مرر',
  heroScrollHintEn: 'Scroll',
  visionTitleAr: 'رؤيتنا',
  visionTitleEn: 'Our Vision',
  visionBodyAr: 'كما بَدأنا بتغيير المفاهيم في التَّصميم الدَّاخلي خاصَّة، نسعى لتحسين وإحداث ثورة في عالم التَّصميم والبناء عامَّة، لنحقِّق تجربة فريدة ترتقي بذائقة عملائنا من النُّخبة المختارة بعناية.',
  visionBodyEn: 'Just as we began by changing the concepts of interior design specifically, we strive to improve and revolutionize the world of design and construction in general — delivering a unique experience that elevates the taste of our carefully chosen, elite clients.',
  teamTitleAr: 'الفريـــق',
  teamTitleEn: 'The Team',
  teamImageAltAr: 'هيكلية فريق سواري',
  teamImageAltEn: 'Sawary team structure',
  teamPhotoUrl: '/images/about/employeStrucure.webp',
  teamPhotoWidth: 2800,
  teamPhotoHeight: 1575,
  faqTitleAr: 'الأسئلة الشائعة',
  faqTitleEn: 'Frequently Asked Questions',
  locationTitleAr: 'موقعنا',
  locationTitleEn: 'Our Location',
  locationAddressAr: '8694 شارع خالد بن الوليد - حي الروضة - الرياض',
  locationAddressEn: '8694 Khalid bin Al-Walid St - Al Rawdah Dist. - Riyadh',
  locationMapTitleAr: 'موقع سواري على الخريطة',
  locationMapTitleEn: 'Sawary location on the map',
  locationMapComingSoonAr: 'الخريطة قريباً',
  locationMapComingSoonEn: 'Map coming soon',
  locationGalleryAltAr: 'مقر سواري',
  locationGalleryAltEn: 'Sawary headquarters',
  sectionLabelWhoWeAreAr: 'من نحن',
  sectionLabelWhoWeAreEn: 'Who We Are',
  sectionLabelTeamStructureAr: 'هيكل المنظومة',
  sectionLabelTeamStructureEn: 'Team Structure',
  sectionLabelFaqAr: 'استفساراتكم',
  sectionLabelFaqEn: 'Inquiries',
  sectionLabelVisitUsAr: 'زورونا',
  sectionLabelVisitUsEn: 'Visit Us',
  sectionLabelStatsAr: 'بالأرقام',
  sectionLabelStatsEn: 'By The Numbers',
  faqItems: [
    { id: 1, orderIndex: 0, questionAr: 'الخدمات؟', questionEn: 'Services?', answerAr: 'نقدم التصميم الداخلي والخارجي ثلاثي الأبعاد وأيضاً التشطيبات والأثاث بشكل كامل.', answerEn: 'We provide 3D interior and exterior design, as well as complete finishing and furniture.', actionLabelAr: null, actionLabelEn: null, actionHref: null },
    { id: 2, orderIndex: 1, questionAr: 'العملاء؟', questionEn: 'Clients?', answerAr: 'نستقبل جميع العملاء ونصمم وننفذ المشاريع السكنية والتجارية وغيرها.', answerEn: 'We welcome all clients and design and execute residential, commercial, and other projects.', actionLabelAr: 'رحلة العميل', actionLabelEn: 'Client Journey', actionHref: '/services' },
    { id: 3, orderIndex: 2, questionAr: 'المدة؟', questionEn: 'Duration?', answerAr: 'كل مشروع له خطة عمل مدروسة ونحدد المدة الزمنية حسب المتطلبات والمواعيد، ولكن عادةً ما تكون المدة المعتادة لمشاريع التصميم 45 يوم عمل.', answerEn: 'Every project has a carefully studied work plan, and we set the timeline based on requirements and deadlines — though design projects typically take around 45 working days.', actionLabelAr: null, actionLabelEn: null, actionHref: null },
    { id: 4, orderIndex: 3, questionAr: 'نوع المواد؟', questionEn: 'Materials?', answerAr: 'نتميز بقدرة على توفير كل من المواد الطبيعية والصناعية ونستخدمها بشكل مناسب لكل مشروع وبجودة عالية تليق بسواري.', answerEn: 'We are able to provide both natural and synthetic materials, using them appropriately for each project with the high quality befitting Sawary.', actionLabelAr: null, actionLabelEn: null, actionHref: null },
    { id: 5, orderIndex: 4, questionAr: 'التواصل؟', questionEn: 'Contact?', answerAr: 'التواصل عبر الهاتف لخدمة العملاء أو عن طريق البريد الإلكتروني.', answerEn: 'Reach us by phone for customer service or by email.', actionLabelAr: 'احجز استشارتك المجانية', actionLabelEn: 'Book Your Free Consultation', actionHref: '/contact' },
  ],
  statItems: [
    { id: 1, orderIndex: 0, labelAr: 'عاماً من الخبرة', labelEn: 'Years of Experience', value: 12, suffix: '+' },
    { id: 2, orderIndex: 1, labelAr: 'مشروع منجز', labelEn: 'Completed Projects', value: 500, suffix: '+' },
    { id: 3, orderIndex: 2, labelAr: 'عميل راضٍ', labelEn: 'Satisfied Clients', value: 7000, suffix: '+' },
  ],
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const res = await fetch(`${API_URL}/api/about`, { cache: 'no-store' })
    if (!res.ok) return FALLBACK
    return await res.json()
  } catch {
    return FALLBACK
  }
}
