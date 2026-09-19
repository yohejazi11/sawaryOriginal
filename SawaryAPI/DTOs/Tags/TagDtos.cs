using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Tags;

public class TagDto
{
    public int Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int ProjectCount { get; set; }
}

public class CreateTagDto
{
    [Required] public string NameAr { get; set; } = string.Empty;
    [Required] public string NameEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Optional explicit slug. Leave empty to auto-generate from NameEn — but a name with
    // no Latin/digit characters auto-generates a random, meaningless slug, which silently
    // breaks any fixed route depending on it. Set this explicitly for the tag slots the
    // frontend routes to by a known slug (commercial/residential/design).
    public string? Slug { get; set; }
}

public class UpdateTagDto
{
    public string? NameAr { get; set; }
    public string? NameEn { get; set; }
    public int? OrderIndex { get; set; }
    public string? Slug { get; set; }
}
