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
}
