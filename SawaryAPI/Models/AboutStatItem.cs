namespace SawaryAPI.Models;

public class AboutStatItem
{
    public int Id { get; set; }
    public string LabelAr { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public int Value { get; set; }
    // e.g. "+" — appended after the animated count-up number, not translated.
    public string? Suffix { get; set; }
    public int OrderIndex { get; set; }
    public int AboutContentId { get; set; }
    public AboutContent AboutContent { get; set; } = null!;
}
