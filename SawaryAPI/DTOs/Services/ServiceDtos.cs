using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Services;

public class ServiceCardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class ServiceSectionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HeroImageUrl { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<ServiceCardDto> Cards { get; set; } = [];
}

public class CreateServiceSectionDto
{
    [Required] public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
}

public class UpdateServiceSectionDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? OrderIndex { get; set; }
}

// Multipart form for POST /api/service-sections/{id}/cards: "title" (text) + "image" (file).
public class CreateServiceCardForm
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public IFormFile Image { get; set; } = null!;
}

public class UpdateServiceCardDto
{
    public string? Title { get; set; }
    public int? OrderIndex { get; set; }
}
