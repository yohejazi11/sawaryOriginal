namespace SawaryAPI.Models;

public class AboutFaqItem
{
    public int Id { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string AnswerAr { get; set; } = string.Empty;
    public string AnswerEn { get; set; } = string.Empty;
    public string? ActionLabelAr { get; set; }
    public string? ActionLabelEn { get; set; }
    // A route path (e.g. "/services") — not translated text, same value in both locales.
    public string? ActionHref { get; set; }
    public int OrderIndex { get; set; }
    public int AboutContentId { get; set; }
    public AboutContent AboutContent { get; set; } = null!;
}
