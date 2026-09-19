using System.ComponentModel.DataAnnotations;
using SawaryAPI.DTOs.Tags;

namespace SawaryAPI.DTOs.Projects;

public class ProjectImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int OrderIndex { get; set; }
    public int? SectionId { get; set; }
}

public class ProjectSectionDto
{
    public int Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<ProjectImageDto> Images { get; set; } = [];
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public int? CoverImageWidth { get; set; }
    public int? CoverImageHeight { get; set; }
    public List<TagDto> Tags { get; set; } = [];
    // Ungrouped images only — grouped images live under their section in Sections.
    public List<ProjectImageDto> Images { get; set; } = [];
    public List<ProjectSectionDto> Sections { get; set; } = [];
}

public class ProjectListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public int OrderIndex { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public int? CoverImageWidth { get; set; }
    public int? CoverImageHeight { get; set; }
    public List<TagDto> Tags { get; set; } = [];
    public int ImageCount { get; set; }
}

public class CreateProjectDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    // Optional — a project can be created with zero tags.
    public List<int> TagIds { get; set; } = [];
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Year { get; set; }
    // Null = leave tags unchanged; an (possibly empty) list replaces the full tag set.
    public List<int>? TagIds { get; set; }
}

public class UpdateOrderDto
{
    [Required] public int OrderIndex { get; set; }
}
