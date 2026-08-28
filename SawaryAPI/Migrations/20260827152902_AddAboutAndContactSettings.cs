using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SawaryAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAboutAndContactSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AboutContent",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeroTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroStatementAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroStatementEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroScrollHintAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroScrollHintEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VisionTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VisionTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VisionBodyAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VisionBodyEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamImageAltAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamImageAltEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamPhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamPhotoPublicId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TeamPhotoWidth = table.Column<int>(type: "int", nullable: true),
                    TeamPhotoHeight = table.Column<int>(type: "int", nullable: true),
                    FaqTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FaqTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationAddressAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationAddressEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationMapTitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationMapTitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationMapComingSoonAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationMapComingSoonEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationGalleryAltAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationGalleryAltEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelWhoWeAreAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelWhoWeAreEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelTeamStructureAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelTeamStructureEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelFaqAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelFaqEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelVisitUsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelVisitUsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelStatsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionLabelStatsEn = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutContent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContactSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WhatsAppNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AboutFaqItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnswerAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnswerEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionLabelAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionLabelEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionHref = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    AboutContentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutFaqItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutFaqItems_AboutContent_AboutContentId",
                        column: x => x.AboutContentId,
                        principalTable: "AboutContent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AboutStatItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LabelAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LabelEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false),
                    Suffix = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    AboutContentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutStatItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutStatItems_AboutContent_AboutContentId",
                        column: x => x.AboutContentId,
                        principalTable: "AboutContent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContactPhoneNumbers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LabelAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LabelEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    ContactSettingsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactPhoneNumbers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactPhoneNumbers_ContactSettings_ContactSettingsId",
                        column: x => x.ContactSettingsId,
                        principalTable: "ContactSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SocialLinks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Platform = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    ContactSettingsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialLinks_ContactSettings_ContactSettingsId",
                        column: x => x.ContactSettingsId,
                        principalTable: "ContactSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AboutContent",
                columns: new[] { "Id", "FaqTitleAr", "FaqTitleEn", "HeroScrollHintAr", "HeroScrollHintEn", "HeroStatementAr", "HeroStatementEn", "HeroTitleAr", "HeroTitleEn", "LocationAddressAr", "LocationAddressEn", "LocationGalleryAltAr", "LocationGalleryAltEn", "LocationMapComingSoonAr", "LocationMapComingSoonEn", "LocationMapTitleAr", "LocationMapTitleEn", "LocationTitleAr", "LocationTitleEn", "SectionLabelFaqAr", "SectionLabelFaqEn", "SectionLabelStatsAr", "SectionLabelStatsEn", "SectionLabelTeamStructureAr", "SectionLabelTeamStructureEn", "SectionLabelVisitUsAr", "SectionLabelVisitUsEn", "SectionLabelWhoWeAreAr", "SectionLabelWhoWeAreEn", "TeamImageAltAr", "TeamImageAltEn", "TeamPhotoHeight", "TeamPhotoPublicId", "TeamPhotoUrl", "TeamPhotoWidth", "TeamTitleAr", "TeamTitleEn", "VisionBodyAr", "VisionBodyEn", "VisionTitleAr", "VisionTitleEn" },
                values: new object[] { 1, "الأسئلة الشائعة", "Frequently Asked Questions", "مرر", "Scroll", "نَنحَت الفراغات بفنّيّة عالية، لِنُقَـدِّم تجارب بصرية تَجمَع بين أصالة الثقافة العربية ورُوح التصميم المُعاصِر، من السعودية نَنطَلِق بروح تنافسية لتحقيق العالمية، في كُلّ تفصيل نَصنَعه هو احتفاء بالهُوِيّة، وكُلّ مشروع نُنَفِّذُه هو قصة تُروَى بَدأَتْها سَوَارِي.", "We carve spaces with great artistry to deliver visual experiences that blend the authenticity of Arab culture with the spirit of contemporary design. From Saudi Arabia, we set out with a competitive spirit to reach the world. Every detail we craft is a celebration of identity, and every project we execute is a story whose telling Sawary began.", "في ســـواري", "At Sawary", "8694 شارع خالد بن الوليد - حي الروضة - الرياض", "8694 Khalid bin Al-Walid St - Al Rawdah Dist. - Riyadh", "مقر سواري", "Sawary headquarters", "الخريطة قريباً", "Map coming soon", "موقع سواري على الخريطة", "Sawary location on the map", "موقعنا", "Our Location", "استفساراتكم", "Inquiries", "بالأرقام", "By The Numbers", "هيكل المنظومة", "Team Structure", "زورونا", "Visit Us", "من نحن", "Who We Are", "هيكلية فريق سواري", "Sawary team structure", 1575, "", "/images/about/employeStrucure.webp", 2800, "الفريـــق", "The Team", "كما بَدأنا بتغيير المفاهيم في التَّصميم الدَّاخلي خاصَّة، نسعى لتحسين وإحداث ثورة في عالم التَّصميم والبناء عامَّة، لنحقِّق تجربة فريدة ترتقي بذائقة عملائنا من النُّخبة المختارة بعناية.", "Just as we began by changing the concepts of interior design specifically, we strive to improve and revolutionize the world of design and construction in general — delivering a unique experience that elevates the taste of our carefully chosen, elite clients.", "رؤيتنا", "Our Vision" });

            migrationBuilder.InsertData(
                table: "ContactSettings",
                columns: new[] { "Id", "Email", "WhatsAppNumber" },
                values: new object[] { 1, "sawarydecor@gmail.com", "966500175000" });

            migrationBuilder.InsertData(
                table: "AboutFaqItems",
                columns: new[] { "Id", "AboutContentId", "ActionHref", "ActionLabelAr", "ActionLabelEn", "AnswerAr", "AnswerEn", "OrderIndex", "QuestionAr", "QuestionEn" },
                values: new object[,]
                {
                    { 1, 1, null, null, null, "نقدم التصميم الداخلي والخارجي ثلاثي الأبعاد وأيضاً التشطيبات والأثاث بشكل كامل.", "We provide 3D interior and exterior design, as well as complete finishing and furniture.", 0, "الخدمات؟", "Services?" },
                    { 2, 1, "/services", "رحلة العميل", "Client Journey", "نستقبل جميع العملاء ونصمم وننفذ المشاريع السكنية والتجارية وغيرها.", "We welcome all clients and design and execute residential, commercial, and other projects.", 1, "العملاء؟", "Clients?" },
                    { 3, 1, null, null, null, "كل مشروع له خطة عمل مدروسة ونحدد المدة الزمنية حسب المتطلبات والمواعيد، ولكن عادةً ما تكون المدة المعتادة لمشاريع التصميم 45 يوم عمل.", "Every project has a carefully studied work plan, and we set the timeline based on requirements and deadlines — though design projects typically take around 45 working days.", 2, "المدة؟", "Duration?" },
                    { 4, 1, null, null, null, "نتميز بقدرة على توفير كل من المواد الطبيعية والصناعية ونستخدمها بشكل مناسب لكل مشروع وبجودة عالية تليق بسواري.", "We are able to provide both natural and synthetic materials, using them appropriately for each project with the high quality befitting Sawary.", 3, "نوع المواد؟", "Materials?" },
                    { 5, 1, "/contact", "احجز استشارتك المجانية", "Book Your Free Consultation", "التواصل عبر الهاتف لخدمة العملاء أو عن طريق البريد الإلكتروني.", "Reach us by phone for customer service or by email.", 4, "التواصل؟", "Contact?" }
                });

            migrationBuilder.InsertData(
                table: "AboutStatItems",
                columns: new[] { "Id", "AboutContentId", "LabelAr", "LabelEn", "OrderIndex", "Suffix", "Value" },
                values: new object[,]
                {
                    { 1, 1, "عاماً من الخبرة", "Years of Experience", 0, "+", 12 },
                    { 2, 1, "مشروع منجز", "Completed Projects", 1, "+", 500 },
                    { 3, 1, "عميل راضٍ", "Satisfied Clients", 2, "+", 7000 }
                });

            migrationBuilder.InsertData(
                table: "ContactPhoneNumbers",
                columns: new[] { "Id", "ContactSettingsId", "LabelAr", "LabelEn", "Number", "OrderIndex" },
                values: new object[] { 1, 1, null, null, "+966500175000", 0 });

            migrationBuilder.InsertData(
                table: "SocialLinks",
                columns: new[] { "Id", "ContactSettingsId", "OrderIndex", "Platform", "Url" },
                values: new object[,]
                {
                    { 1, 1, 0, "instagram", "https://www.instagram.com/sawary.de/" },
                    { 2, 1, 1, "x", "https://x.com/SawaryDe" },
                    { 3, 1, 2, "youtube", "https://www.youtube.com/@SAWARYDE" },
                    { 4, 1, 3, "pinterest", "https://www.pinterest.com/sawarydecorproject/" },
                    { 5, 1, 4, "tiktok", "https://www.tiktok.com/@sawary.de" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AboutFaqItems_AboutContentId",
                table: "AboutFaqItems",
                column: "AboutContentId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutStatItems_AboutContentId",
                table: "AboutStatItems",
                column: "AboutContentId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactPhoneNumbers_ContactSettingsId",
                table: "ContactPhoneNumbers",
                column: "ContactSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialLinks_ContactSettingsId",
                table: "SocialLinks",
                column: "ContactSettingsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutFaqItems");

            migrationBuilder.DropTable(
                name: "AboutStatItems");

            migrationBuilder.DropTable(
                name: "ContactPhoneNumbers");

            migrationBuilder.DropTable(
                name: "SocialLinks");

            migrationBuilder.DropTable(
                name: "AboutContent");

            migrationBuilder.DropTable(
                name: "ContactSettings");
        }
    }
}
