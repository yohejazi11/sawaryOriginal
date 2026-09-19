namespace SawaryAPI.Models;

// A content block on the public Services page (e.g. "Design", "Execution"), with a
// hero image and an ordered list of cards. Mirrors SawaryAPI-PHP's service_sections table.
public class ServiceSection
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HeroImageUrl { get; set; } = string.Empty;
    public string? HeroImagePublicId { get; set; }
    public int OrderIndex { get; set; }
    public ICollection<ServiceCard> Cards { get; set; } = [];
}
