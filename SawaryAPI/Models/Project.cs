namespace SawaryAPI.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CoverImageUrl { get; set; } = string.Empty;
    public int? CoverImageWidth { get; set; }
    public int? CoverImageHeight { get; set; }
    public ICollection<ProjectImage> Images { get; set; } = [];
    public ICollection<ProjectSection> Sections { get; set; } = [];
    public ICollection<ProjectTag> ProjectTags { get; set; } = [];
}
