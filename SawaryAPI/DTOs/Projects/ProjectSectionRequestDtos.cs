using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Projects;

public class CreateProjectSectionDto
{
    [Required] public string NameAr { get; set; } = string.Empty;
    [Required] public string NameEn { get; set; } = string.Empty;
    public int? OrderIndex { get; set; }
}

public class UpdateProjectSectionDto
{
    public string? NameAr { get; set; }
    public string? NameEn { get; set; }
    public int? OrderIndex { get; set; }
}

// PATCH /api/images/{id}/section body. SectionId is deliberately nullable-and-present
// (not omittable) so the client can explicitly move an image back to "ungrouped".
public class MoveImageToSectionDto
{
    public int? SectionId { get; set; }
}
