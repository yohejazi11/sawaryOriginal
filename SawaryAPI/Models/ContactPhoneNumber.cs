namespace SawaryAPI.Models;

public class ContactPhoneNumber
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    // Optional descriptive label (e.g. "خدمة العملاء") — not required, plain display text.
    public string? LabelAr { get; set; }
    public string? LabelEn { get; set; }
    public int OrderIndex { get; set; }
    public int ContactSettingsId { get; set; }
    public ContactSettings ContactSettings { get; set; } = null!;
}
