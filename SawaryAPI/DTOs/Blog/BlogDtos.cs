using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Blog;

// List shape — no body, keeps the /blog index payload small.
public class BlogPostListDto
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ExcerptAr { get; set; }
    public string? ExcerptEn { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BlogPostDto : BlogPostListDto
{
    public string ContentAr { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public int? CoverImageWidth { get; set; }
    public int? CoverImageHeight { get; set; }
}

public class CreateBlogPostDto
{
    [Required, MaxLength(250)] public string TitleAr { get; set; } = string.Empty;
    [Required, MaxLength(250)] public string TitleEn { get; set; } = string.Empty;
    /// <summary>Optional — generated from TitleEn when empty.</summary>
    [MaxLength(200)] public string? Slug { get; set; }
    [MaxLength(600)] public string? ExcerptAr { get; set; }
    [MaxLength(600)] public string? ExcerptEn { get; set; }
    [Required] public string ContentAr { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public bool IsPublished { get; set; }
}

// Every field optional — only the ones sent are changed.
public class UpdateBlogPostDto
{
    [MaxLength(250)] public string? TitleAr { get; set; }
    [MaxLength(250)] public string? TitleEn { get; set; }
    [MaxLength(200)] public string? Slug { get; set; }
    [MaxLength(600)] public string? ExcerptAr { get; set; }
    [MaxLength(600)] public string? ExcerptEn { get; set; }
    public string? ContentAr { get; set; }
    public string? ContentEn { get; set; }
    public bool? IsPublished { get; set; }
}
