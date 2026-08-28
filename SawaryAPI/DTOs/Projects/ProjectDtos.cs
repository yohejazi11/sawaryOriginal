using System.ComponentModel.DataAnnotations;
using SawaryAPI.DTOs.Categories;

namespace SawaryAPI.DTOs.Projects;

public class ProjectImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int OrderIndex { get; set; }
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
    public CategoryDto? Category { get; set; }
    public List<ProjectImageDto> Images { get; set; } = [];
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
    public CategoryDto? Category { get; set; }
    public int ImageCount { get; set; }
}

public class CreateProjectDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    [Required] public int CategoryId { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Year { get; set; }
    public int? CategoryId { get; set; }
}

public class UpdateOrderDto
{
    [Required] public int OrderIndex { get; set; }
}
