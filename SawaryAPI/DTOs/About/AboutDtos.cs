using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.About;

public class AboutFaqItemDto
{
    public int Id { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string AnswerAr { get; set; } = string.Empty;
    public string AnswerEn { get; set; } = string.Empty;
    public string? ActionLabelAr { get; set; }
    public string? ActionLabelEn { get; set; }
    public string? ActionHref { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateAboutFaqItemDto
{
    [Required] public string QuestionAr { get; set; } = string.Empty;
    [Required] public string QuestionEn { get; set; } = string.Empty;
    [Required] public string AnswerAr { get; set; } = string.Empty;
    [Required] public string AnswerEn { get; set; } = string.Empty;
    public string? ActionLabelAr { get; set; }
    public string? ActionLabelEn { get; set; }
    public string? ActionHref { get; set; }
}

public class UpdateAboutFaqItemDto
{
    public string? QuestionAr { get; set; }
    public string? QuestionEn { get; set; }
    public string? AnswerAr { get; set; }
    public string? AnswerEn { get; set; }
    public string? ActionLabelAr { get; set; }
    public string? ActionLabelEn { get; set; }
    public string? ActionHref { get; set; }
}

public class AboutStatItemDto
{
    public int Id { get; set; }
    public string LabelAr { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public int Value { get; set; }
    public string? Suffix { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateAboutStatItemDto
{
    [Required] public string LabelAr { get; set; } = string.Empty;
    [Required] public string LabelEn { get; set; } = string.Empty;
    [Required] public int Value { get; set; }
    public string? Suffix { get; set; }
}

public class UpdateAboutStatItemDto
{
    public string? LabelAr { get; set; }
    public string? LabelEn { get; set; }
    public int? Value { get; set; }
    public string? Suffix { get; set; }
}

public class AboutContentDto
{
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

    public List<AboutFaqItemDto> FaqItems { get; set; } = [];
    public List<AboutStatItemDto> StatItems { get; set; } = [];
}

// All-nullable partial-patch DTO, same convention as UpdateProjectDto.
public class UpdateAboutContentDto
{
    public string? HeroTitleAr { get; set; }
    public string? HeroTitleEn { get; set; }
    public string? HeroStatementAr { get; set; }
    public string? HeroStatementEn { get; set; }
    public string? HeroScrollHintAr { get; set; }
    public string? HeroScrollHintEn { get; set; }

    public string? VisionTitleAr { get; set; }
    public string? VisionTitleEn { get; set; }
    public string? VisionBodyAr { get; set; }
    public string? VisionBodyEn { get; set; }

    public string? TeamTitleAr { get; set; }
    public string? TeamTitleEn { get; set; }
    public string? TeamImageAltAr { get; set; }
    public string? TeamImageAltEn { get; set; }

    public string? FaqTitleAr { get; set; }
    public string? FaqTitleEn { get; set; }

    public string? LocationTitleAr { get; set; }
    public string? LocationTitleEn { get; set; }
    public string? LocationAddressAr { get; set; }
    public string? LocationAddressEn { get; set; }
    public string? LocationMapTitleAr { get; set; }
    public string? LocationMapTitleEn { get; set; }
    public string? LocationMapComingSoonAr { get; set; }
    public string? LocationMapComingSoonEn { get; set; }
    public string? LocationGalleryAltAr { get; set; }
    public string? LocationGalleryAltEn { get; set; }

    public string? SectionLabelWhoWeAreAr { get; set; }
    public string? SectionLabelWhoWeAreEn { get; set; }
    public string? SectionLabelTeamStructureAr { get; set; }
    public string? SectionLabelTeamStructureEn { get; set; }
    public string? SectionLabelFaqAr { get; set; }
    public string? SectionLabelFaqEn { get; set; }
    public string? SectionLabelVisitUsAr { get; set; }
    public string? SectionLabelVisitUsEn { get; set; }
    public string? SectionLabelStatsAr { get; set; }
    public string? SectionLabelStatsEn { get; set; }
}
