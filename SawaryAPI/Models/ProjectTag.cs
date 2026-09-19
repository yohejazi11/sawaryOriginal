namespace SawaryAPI.Models;

// Join entity for the Project <-> Tag many-to-many relationship.
public class ProjectTag
{
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
