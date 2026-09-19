namespace SawaryAPI.Models;

// Singleton row — always Id = 1 (same convention as AdminUser's seeded row).
// Every visitor-facing text field is bilingual (Ar/En pairs) per the site's existing
// hreflang/bilingual-routing architecture; the team photo mirrors Project's single
// cover-image shape (Url/PublicId/Width/Height) rather than a child image collection,
// since there is exactly one photo.
public class AboutContent
{
    public int Id { get; set; }

    public string HeroTitleAr { get; set; } = string.Empty;
    public string HeroTitleEn { get; set; } = string.Empty;
    public string HeroStatementAr { get; set; } = string.Empty;
    public string HeroStatementEn { get; set; } = string.Empty;
    public string HeroScrollHintAr { get; set; } = string.Empty;
    public string HeroScrollHintEn { get; set; } = string.Empty;

    public string VisionTitleAr { get; set; } = string.Empty;
    public string VisionTitleEn { get; set; } = string.Empty;
    public string VisionBodyAr { get; set; } = string.Empty;
    public string VisionBodyEn { get; set; } = string.Empty;

    public string TeamTitleAr { get; set; } = string.Empty;
    public string TeamTitleEn { get; set; } = string.Empty;
    public string TeamImageAltAr { get; set; } = string.Empty;
    public string TeamImageAltEn { get; set; } = string.Empty;
    public string TeamPhotoUrl { get; set; } = string.Empty;
    public string TeamPhotoPublicId { get; set; } = string.Empty;
    public int? TeamPhotoWidth { get; set; }
    public int? TeamPhotoHeight { get; set; }

    public string FaqTitleAr { get; set; } = string.Empty;
    public string FaqTitleEn { get; set; } = string.Empty;

    public string LocationTitleAr { get; set; } = string.Empty;
    public string LocationTitleEn { get; set; } = string.Empty;
    public string LocationAddressAr { get; set; } = string.Empty;
    public string LocationAddressEn { get; set; } = string.Empty;
    public string LocationMapTitleAr { get; set; } = string.Empty;
    public string LocationMapTitleEn { get; set; } = string.Empty;
    public string LocationMapComingSoonAr { get; set; } = string.Empty;
    public string LocationMapComingSoonEn { get; set; } = string.Empty;
    public string LocationGalleryAltAr { get; set; } = string.Empty;
    public string LocationGalleryAltEn { get; set; } = string.Empty;

    public string SectionLabelWhoWeAreAr { get; set; } = string.Empty;
    public string SectionLabelWhoWeAreEn { get; set; } = string.Empty;
    public string SectionLabelTeamStructureAr { get; set; } = string.Empty;
    public string SectionLabelTeamStructureEn { get; set; } = string.Empty;
    public string SectionLabelFaqAr { get; set; } = string.Empty;
    public string SectionLabelFaqEn { get; set; } = string.Empty;
    public string SectionLabelVisitUsAr { get; set; } = string.Empty;
    public string SectionLabelVisitUsEn { get; set; } = string.Empty;
    public string SectionLabelStatsAr { get; set; } = string.Empty;
    public string SectionLabelStatsEn { get; set; } = string.Empty;

    public ICollection<AboutFaqItem> FaqItems { get; set; } = [];
    public ICollection<AboutStatItem> StatItems { get; set; } = [];
}
