namespace SawaryAPI.Models;

// One image+title card belonging to a ServiceSection. Mirrors SawaryAPI-PHP's
// service_cards table.
public class ServiceCard
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public int OrderIndex { get; set; }
    public int SectionId { get; set; }
    public ServiceSection Section { get; set; } = null!;
}
