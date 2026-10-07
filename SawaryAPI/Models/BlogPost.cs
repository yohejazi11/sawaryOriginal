namespace SawaryAPI.Models;

// An article on the public /blog page. Content is plain text with light formatting
// (blank line = new paragraph, "## " = heading, "- " = bullet) rendered by the frontend.
// Drafts (IsPublished = false) are only visible in the admin panel.
public class BlogPost
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ExcerptAr { get; set; }
    public string? ExcerptEn { get; set; }
    public string ContentAr { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public string? CoverImagePublicId { get; set; }
    public int? CoverImageWidth { get; set; }
    public int? CoverImageHeight { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
