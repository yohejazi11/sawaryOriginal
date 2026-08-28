using Microsoft.EntityFrameworkCore;
using SawaryAPI.Models;

namespace SawaryAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<AboutContent> AboutContent => Set<AboutContent>();
    public DbSet<AboutFaqItem> AboutFaqItems => Set<AboutFaqItem>();
    public DbSet<AboutStatItem> AboutStatItems => Set<AboutStatItem>();
    public DbSet<ContactSettings> ContactSettings => Set<ContactSettings>();
    public DbSet<ContactPhoneNumber> ContactPhoneNumbers => Set<ContactPhoneNumber>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Arabic_100_CI_AS — supports Arabic Unicode, case-insensitive, accent-sensitive
        modelBuilder.UseCollation("Arabic_100_CI_AS");

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
            e.Property(c => c.Slug).IsRequired().HasMaxLength(100);
            e.Property(c => c.Type).IsRequired().HasMaxLength(50);
            e.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<Project>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.Slug).IsRequired().HasMaxLength(200);
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasOne(p => p.Category)
             .WithMany(c => c.Projects)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProjectImage>(e =>
        {
            e.HasKey(i => i.Id);
            e.HasOne(i => i.Project)
             .WithMany(p => p.Images)
             .HasForeignKey(i => i.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AboutContent>(e => e.HasKey(a => a.Id));

        modelBuilder.Entity<AboutFaqItem>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasOne(f => f.AboutContent)
             .WithMany(a => a.FaqItems)
             .HasForeignKey(f => f.AboutContentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AboutStatItem>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.AboutContent)
             .WithMany(a => a.StatItems)
             .HasForeignKey(s => s.AboutContentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ContactSettings>(e => e.HasKey(c => c.Id));

        modelBuilder.Entity<ContactPhoneNumber>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.ContactSettings)
             .WithMany(c => c.PhoneNumbers)
             .HasForeignKey(p => p.ContactSettingsId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SocialLink>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.ContactSettings)
             .WithMany(c => c.SocialLinks)
             .HasForeignKey(s => s.ContactSettingsId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default admin — password: Sawary@2026
        // Hash is pre-computed (stable) so migrations don't detect spurious changes
        modelBuilder.Entity<AdminUser>().HasData(new AdminUser
        {
            Id = 1,
            Username = "admin",
            PasswordHash = "$2a$11$33cMVDQjr.eIkBdXauEcp.O56VnEj/i27T.Yf0njbu/hJ4tX9VK32",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });

        // Seed the About/Contact singletons with the site's *current* real copy
        // (transplanted verbatim from locales/ar.js + en.js at the time this feature was
        // built) so the public site shows no regression the moment this ships — from here
        // on, admins edit this DB content directly instead of the locale files.
        modelBuilder.Entity<AboutContent>().HasData(new AboutContent
        {
            Id = 1,
            HeroTitleAr = "في ســـواري",
            HeroTitleEn = "At Sawary",
            HeroStatementAr = "نَنحَت الفراغات بفنّيّة عالية، لِنُقَـدِّم تجارب بصرية تَجمَع بين أصالة الثقافة العربية ورُوح التصميم المُعاصِر، من السعودية نَنطَلِق بروح تنافسية لتحقيق العالمية، في كُلّ تفصيل نَصنَعه هو احتفاء بالهُوِيّة، وكُلّ مشروع نُنَفِّذُه هو قصة تُروَى بَدأَتْها سَوَارِي.",
            HeroStatementEn = "We carve spaces with great artistry to deliver visual experiences that blend the authenticity of Arab culture with the spirit of contemporary design. From Saudi Arabia, we set out with a competitive spirit to reach the world. Every detail we craft is a celebration of identity, and every project we execute is a story whose telling Sawary began.",
            HeroScrollHintAr = "مرر",
            HeroScrollHintEn = "Scroll",
            VisionTitleAr = "رؤيتنا",
            VisionTitleEn = "Our Vision",
            VisionBodyAr = "كما بَدأنا بتغيير المفاهيم في التَّصميم الدَّاخلي خاصَّة، نسعى لتحسين وإحداث ثورة في عالم التَّصميم والبناء عامَّة، لنحقِّق تجربة فريدة ترتقي بذائقة عملائنا من النُّخبة المختارة بعناية.",
            VisionBodyEn = "Just as we began by changing the concepts of interior design specifically, we strive to improve and revolutionize the world of design and construction in general — delivering a unique experience that elevates the taste of our carefully chosen, elite clients.",
            TeamTitleAr = "الفريـــق",
            TeamTitleEn = "The Team",
            TeamImageAltAr = "هيكلية فريق سواري",
            TeamImageAltEn = "Sawary team structure",
            TeamPhotoUrl = "/images/about/employeStrucure.webp",
            TeamPhotoPublicId = "",
            TeamPhotoWidth = 2800,
            TeamPhotoHeight = 1575,
            FaqTitleAr = "الأسئلة الشائعة",
            FaqTitleEn = "Frequently Asked Questions",
            LocationTitleAr = "موقعنا",
            LocationTitleEn = "Our Location",
            LocationAddressAr = "8694 شارع خالد بن الوليد - حي الروضة - الرياض",
            LocationAddressEn = "8694 Khalid bin Al-Walid St - Al Rawdah Dist. - Riyadh",
            LocationMapTitleAr = "موقع سواري على الخريطة",
            LocationMapTitleEn = "Sawary location on the map",
            LocationMapComingSoonAr = "الخريطة قريباً",
            LocationMapComingSoonEn = "Map coming soon",
            LocationGalleryAltAr = "مقر سواري",
            LocationGalleryAltEn = "Sawary headquarters",
            SectionLabelWhoWeAreAr = "من نحن",
            SectionLabelWhoWeAreEn = "Who We Are",
            SectionLabelTeamStructureAr = "هيكل المنظومة",
            SectionLabelTeamStructureEn = "Team Structure",
            SectionLabelFaqAr = "استفساراتكم",
            SectionLabelFaqEn = "Inquiries",
            SectionLabelVisitUsAr = "زورونا",
            SectionLabelVisitUsEn = "Visit Us",
            SectionLabelStatsAr = "بالأرقام",
            SectionLabelStatsEn = "By The Numbers",
        });

        modelBuilder.Entity<AboutFaqItem>().HasData(
            new AboutFaqItem { Id = 1, AboutContentId = 1, OrderIndex = 0, QuestionAr = "الخدمات؟", QuestionEn = "Services?", AnswerAr = "نقدم التصميم الداخلي والخارجي ثلاثي الأبعاد وأيضاً التشطيبات والأثاث بشكل كامل.", AnswerEn = "We provide 3D interior and exterior design, as well as complete finishing and furniture." },
            new AboutFaqItem { Id = 2, AboutContentId = 1, OrderIndex = 1, QuestionAr = "العملاء؟", QuestionEn = "Clients?", AnswerAr = "نستقبل جميع العملاء ونصمم وننفذ المشاريع السكنية والتجارية وغيرها.", AnswerEn = "We welcome all clients and design and execute residential, commercial, and other projects.", ActionLabelAr = "رحلة العميل", ActionLabelEn = "Client Journey", ActionHref = "/services" },
            new AboutFaqItem { Id = 3, AboutContentId = 1, OrderIndex = 2, QuestionAr = "المدة؟", QuestionEn = "Duration?", AnswerAr = "كل مشروع له خطة عمل مدروسة ونحدد المدة الزمنية حسب المتطلبات والمواعيد، ولكن عادةً ما تكون المدة المعتادة لمشاريع التصميم 45 يوم عمل.", AnswerEn = "Every project has a carefully studied work plan, and we set the timeline based on requirements and deadlines — though design projects typically take around 45 working days." },
            new AboutFaqItem { Id = 4, AboutContentId = 1, OrderIndex = 3, QuestionAr = "نوع المواد؟", QuestionEn = "Materials?", AnswerAr = "نتميز بقدرة على توفير كل من المواد الطبيعية والصناعية ونستخدمها بشكل مناسب لكل مشروع وبجودة عالية تليق بسواري.", AnswerEn = "We are able to provide both natural and synthetic materials, using them appropriately for each project with the high quality befitting Sawary." },
            new AboutFaqItem { Id = 5, AboutContentId = 1, OrderIndex = 4, QuestionAr = "التواصل؟", QuestionEn = "Contact?", AnswerAr = "التواصل عبر الهاتف لخدمة العملاء أو عن طريق البريد الإلكتروني.", AnswerEn = "Reach us by phone for customer service or by email.", ActionLabelAr = "احجز استشارتك المجانية", ActionLabelEn = "Book Your Free Consultation", ActionHref = "/contact" }
        );

        // No stats section exists on /about today — seeded with the same figures already
        // shown on /services/design so the new section starts from real, consistent numbers.
        modelBuilder.Entity<AboutStatItem>().HasData(
            new AboutStatItem { Id = 1, AboutContentId = 1, OrderIndex = 0, LabelAr = "عاماً من الخبرة", LabelEn = "Years of Experience", Value = 12, Suffix = "+" },
            new AboutStatItem { Id = 2, AboutContentId = 1, OrderIndex = 1, LabelAr = "مشروع منجز", LabelEn = "Completed Projects", Value = 500, Suffix = "+" },
            new AboutStatItem { Id = 3, AboutContentId = 1, OrderIndex = 2, LabelAr = "عميل راضٍ", LabelEn = "Satisfied Clients", Value = 7000, Suffix = "+" }
        );

        modelBuilder.Entity<ContactSettings>().HasData(new ContactSettings
        {
            Id = 1,
            WhatsAppNumber = "966500175000",
            Email = "sawarydecor@gmail.com",
        });

        modelBuilder.Entity<ContactPhoneNumber>().HasData(
            new ContactPhoneNumber { Id = 1, ContactSettingsId = 1, OrderIndex = 0, Number = "+966500175000" }
        );

        modelBuilder.Entity<SocialLink>().HasData(
            new SocialLink { Id = 1, ContactSettingsId = 1, OrderIndex = 0, Platform = "instagram", Url = "https://www.instagram.com/sawary.de/" },
            new SocialLink { Id = 2, ContactSettingsId = 1, OrderIndex = 1, Platform = "x", Url = "https://x.com/SawaryDe" },
            new SocialLink { Id = 3, ContactSettingsId = 1, OrderIndex = 2, Platform = "youtube", Url = "https://www.youtube.com/@SAWARYDE" },
            new SocialLink { Id = 4, ContactSettingsId = 1, OrderIndex = 3, Platform = "pinterest", Url = "https://www.pinterest.com/sawarydecorproject/" },
            new SocialLink { Id = 5, ContactSettingsId = 1, OrderIndex = 4, Platform = "tiktok", Url = "https://www.tiktok.com/@sawary.de" }
        );
    }
}
