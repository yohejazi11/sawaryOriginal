namespace SawaryAPI.Models;

// A named sub-group of a project's images (e.g. "Bathroom", "Office"). Optional —
// a project can have zero sections, in which case all its images are ungrouped.
public class ProjectSection
{
    public int Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public ICollection<ProjectImage> Images { get; set; } = [];
}
