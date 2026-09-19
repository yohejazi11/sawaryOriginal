namespace SawaryAPI.Models;

public class ProjectImage
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;   // path relative to wwwroot, used for deletion
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int OrderIndex { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // Optional sub-group within the project's gallery (e.g. "Bathroom", "Office").
    // Null = ungrouped. Deleting the section demotes its images to ungrouped rather
    // than deleting them (see AppDbContext: OnDelete(DeleteBehavior.SetNull)).
    public int? SectionId { get; set; }
    public ProjectSection? Section { get; set; }
}
