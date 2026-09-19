using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Services;
using SawaryAPI.Helpers;
using SawaryAPI.Models;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/service-sections")]
public class ServiceSectionsController(AppDbContext db) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase) { "jpg", "jpeg", "png", "webp" };
    private const long MaxFileSize = LocalImageStorageService.MaxBytes;

    private static ServiceCardDto MapCard(ServiceCard c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        ImageUrl = c.ImageUrl,
        OrderIndex = c.OrderIndex,
    };

    private static ServiceSectionDto MapSection(ServiceSection s) => new()
    {
        Id = s.Id,
        Title = s.Title,
        Slug = s.Slug,
        Description = s.Description,
        HeroImageUrl = s.HeroImageUrl,
        OrderIndex = s.OrderIndex,
        Cards = s.Cards.OrderBy(c => c.OrderIndex).Select(MapCard).ToList(),
    };

    private void DeleteUploadedFile(IWebHostEnvironment env, string? publicId)
    {
        if (string.IsNullOrEmpty(publicId)) return;
        var fullPath = Path.Combine(env.WebRootPath, publicId.Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
    }

    // GET /api/service-sections — public
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sections = await db.ServiceSections
            .Include(s => s.Cards)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync();

        return Ok(sections.Select(MapSection));
    }

    // GET /api/service-sections/{id:int} — public
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var section = await db.ServiceSections.Include(s => s.Cards).FirstOrDefaultAsync(s => s.Id == id);
        if (section is null) return NotFound();
        return Ok(MapSection(section));
    }

    // GET /api/service-sections/{slug} — public
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var section = await db.ServiceSections.Include(s => s.Cards).FirstOrDefaultAsync(s => s.Slug == slug);
        if (section is null) return NotFound();
        return Ok(MapSection(section));
    }

    // POST /api/service-sections — admin only
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServiceSectionDto dto)
    {
        var baseSlug = SlugHelper.Slugify(dto.Title);
        var slug = baseSlug;
        var suffix = 2;
        while (await db.ServiceSections.AnyAsync(s => s.Slug == slug))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        var section = new ServiceSection
        {
            Title = dto.Title,
            Slug = slug,
            Description = dto.Description,
            HeroImageUrl = string.Empty,
            OrderIndex = dto.OrderIndex,
        };

        db.ServiceSections.Add(section);
        await db.SaveChangesAsync();

        return Ok(MapSection(section));
    }

    // PUT /api/service-sections/{id} — admin only
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceSectionDto dto)
    {
        var section = await db.ServiceSections.FindAsync(id);
        if (section is null) return NotFound();

        if (dto.Title is not null) section.Title = dto.Title;
        if (dto.Description is not null) section.Description = dto.Description;
        if (dto.OrderIndex.HasValue) section.OrderIndex = dto.OrderIndex.Value;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/service-sections/{id} — admin only
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromServices] IWebHostEnvironment env)
    {
        var section = await db.ServiceSections.Include(s => s.Cards).FirstOrDefaultAsync(s => s.Id == id);
        if (section is null) return NotFound();

        foreach (var card in section.Cards)
            DeleteUploadedFile(env, card.PublicId);
        DeleteUploadedFile(env, section.HeroImagePublicId);

        db.ServiceSections.Remove(section);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/service-sections/{id}/hero — admin only, multipart form key "image"
    [Authorize]
    [HttpPost("{id:int}/hero")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> UploadHero(int id, IFormFile image, [FromServices] LocalImageStorageService storage)
    {
        var section = await db.ServiceSections.FindAsync(id);
        if (section is null) return NotFound();

        var ext = Path.GetExtension(image.FileName).TrimStart('.').ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext)) return BadRequest(new { message = "Invalid file type" });
        if (image.Length > MaxFileSize) return BadRequest(new { message = "File too large" });

        var relativePath = await storage.SaveImageAsync(image, $"services/{section.Slug}");
        var url = $"{Request.Scheme}://{Request.Host}/{relativePath}";

        var oldPublicId = section.HeroImagePublicId;

        section.HeroImageUrl = url;
        section.HeroImagePublicId = relativePath;
        await db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(oldPublicId))
        {
            try { storage.DeleteImage(oldPublicId); }
            catch { /* file deletion failure must not block the update */ }
        }

        return Ok(new { heroImageUrl = url });
    }

    // POST /api/service-sections/{id}/cards — admin only, multipart form: "title" + "image"
    [Authorize]
    [HttpPost("{id:int}/cards")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> CreateCard(int id, [FromForm] string title, IFormFile image, [FromServices] LocalImageStorageService storage)
    {
        var section = await db.ServiceSections.FindAsync(id);
        if (section is null) return NotFound();

        if (string.IsNullOrWhiteSpace(title)) return BadRequest(new { message = "العنوان مطلوب" });

        var ext = Path.GetExtension(image.FileName).TrimStart('.').ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext)) return BadRequest(new { message = "Invalid file type" });
        if (image.Length > MaxFileSize) return BadRequest(new { message = "File too large" });

        var relativePath = await storage.SaveImageAsync(image, $"services/{section.Slug}/cards");
        var url = $"{Request.Scheme}://{Request.Host}/{relativePath}";

        var nextOrder = await db.ServiceCards
            .Where(c => c.SectionId == id)
            .Select(c => (int?)c.OrderIndex)
            .MaxAsync() ?? -1;

        var card = new ServiceCard
        {
            Title = title,
            ImageUrl = url,
            PublicId = relativePath,
            OrderIndex = nextOrder + 1,
            SectionId = id,
        };

        db.ServiceCards.Add(card);
        await db.SaveChangesAsync();

        return Ok(MapCard(card));
    }
}
