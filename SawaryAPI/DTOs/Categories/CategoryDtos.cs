using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Categories;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int ProjectCount { get; set; }
}

public class CreateCategoryDto
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string Type { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Optional explicit slug. Leave empty to auto-generate from Name — but Name with
    // no Latin/digit characters (e.g. pure Arabic) auto-generates a random, meaningless
    // slug, which silently breaks any fixed route depending on it. Set this explicitly
    // for category slots the frontend routes to by a known slug (commercial/residential).
    public string? Slug { get; set; }
}

public class UpdateCategoryDto
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public int? OrderIndex { get; set; }
    public string? Slug { get; set; }
}
