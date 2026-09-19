namespace SawaryAPI.Models;

public class SocialLink
{
    public int Id { get; set; }
    // e.g. "instagram", "x", "youtube", "pinterest", "tiktok" — the frontend maps this
    // to an icon from components/ui/SocialIcons.tsx, falling back to a generic link
    // icon for any platform string it doesn't recognize. No icon upload is needed.
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int ContactSettingsId { get; set; }
    public ContactSettings ContactSettings { get; set; } = null!;
}
