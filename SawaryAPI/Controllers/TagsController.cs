using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Tags;
using SawaryAPI.Helpers;
using SawaryAPI.Models;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/tags")]
public class TagsController(AppDbContext db) : ControllerBase
{
    private static async Task<string> ResolveUniqueSlugAsync(AppDbContext db, string? requestedSlug, string? name, int? excludeId = null)
    {
        var baseSlug = string.IsNullOrWhiteSpace(requestedSlug)
            ? SlugHelper.Slugify(name ?? string.Empty)
            : SlugHelper.Slugify(requestedSlug);

        var slug = baseSlug;
        var suffix = 2;
        while (await db.Tags.AnyAsync(t => t.Slug == slug && t.Id != excludeId))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }
        return slug;
    }

    private static TagDto MapToDto(Tag t) => new()
    {
        Id = t.Id,
        NameAr = t.NameAr,
        NameEn = t.NameEn,
        Slug = t.Slug,
        OrderIndex = t.OrderIndex,
        ProjectCount = t.ProjectTags.Count,
    };

    // GET /api/tags — public
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tags = await db.Tags
            .Include(t => t.ProjectTags)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync();

        return Ok(tags.Select(MapToDto));
    }

    // GET /api/tags/{id:int} — public
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var tag = await db.Tags.Include(t => t.ProjectTags).FirstOrDefaultAsync(t => t.Id == id);
        if (tag is null) return NotFound();
        return Ok(MapToDto(tag));
    }

    // GET /api/tags/{slug} — public
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var tag = await db.Tags.Include(t => t.ProjectTags).FirstOrDefaultAsync(t => t.Slug == slug);
        if (tag is null) return NotFound();
        return Ok(MapToDto(tag));
    }

    // POST /api/tags — admin only
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTagDto dto)
    {
        var slug = await ResolveUniqueSlugAsync(db, dto.Slug, dto.NameEn);

        var tag = new Tag
        {
            NameAr = dto.NameAr,
            NameEn = dto.NameEn,
            Slug = slug,
            OrderIndex = dto.OrderIndex,
        };

        db.Tags.Add(tag);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBySlug), new { slug = tag.Slug }, new TagDto
        {
            Id = tag.Id,
            NameAr = tag.NameAr,
            NameEn = tag.NameEn,
            Slug = tag.Slug,
            OrderIndex = tag.OrderIndex,
        });
    }

    // PUT /api/tags/{id} — admin only
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTagDto dto)
    {
        var tag = await db.Tags.FindAsync(id);
        if (tag is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.NameAr)) tag.NameAr = dto.NameAr;
        if (!string.IsNullOrWhiteSpace(dto.NameEn)) tag.NameEn = dto.NameEn;
        if (dto.OrderIndex.HasValue) tag.OrderIndex = dto.OrderIndex.Value;

        // Slug is left alone unless explicitly provided — changing it silently would
        // break any URL already keyed off it (e.g. /services/execution's tag lookups).
        if (!string.IsNullOrWhiteSpace(dto.Slug))
            tag.Slug = await ResolveUniqueSlugAsync(db, dto.Slug, dto.NameEn, excludeId: id);

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/tags/{id} — admin only. Unlike the old single-category-per-project
    // model, a tag is many-to-many and optional, so deleting it just detaches it from
    // any tagged projects (cascade on ProjectTag) rather than being blocked.
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tag = await db.Tags.FindAsync(id);
        if (tag is null) return NotFound();

        db.Tags.Remove(tag);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
