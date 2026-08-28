using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Categories;
using SawaryAPI.Helpers;
using SawaryAPI.Models;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    // The frontend's category-type filtering (design vs execution sections, service
    // pages) is a hard-coded string match against this value — the admin UI's <select>
    // only ever sends one of these two, but the API must not trust that: a raw request
    // with any other Type would silently fall out of both site sections.
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.Ordinal) { "design", "execution" };

    private static async Task<string> ResolveUniqueSlugAsync(AppDbContext db, string? requestedSlug, string? name, int? excludeId = null)
    {
        var baseSlug = string.IsNullOrWhiteSpace(requestedSlug)
            ? SlugHelper.Slugify(name ?? string.Empty)
            : SlugHelper.Slugify(requestedSlug);

        var slug = baseSlug;
        var suffix = 2;
        while (await db.Categories.AnyAsync(c => c.Slug == slug && c.Id != excludeId))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }
        return slug;
    }

    // GET /api/categories — public
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await db.Categories
            .Include(c => c.Projects)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Type = c.Type,
                OrderIndex = c.OrderIndex,
                ProjectCount = c.Projects.Count,
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET /api/categories/{id:int} — public
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await db.Categories
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null) return NotFound();

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Type = category.Type,
            OrderIndex = category.OrderIndex,
            ProjectCount = category.Projects.Count,
        });
    }

    // GET /api/categories/{slug} — public
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var category = await db.Categories
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (category is null) return NotFound();

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Type = category.Type,
            OrderIndex = category.OrderIndex,
            ProjectCount = category.Projects.Count,
        });
    }

    // POST /api/categories — admin only
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        if (!AllowedTypes.Contains(dto.Type))
            return BadRequest(new { message = "النوع يجب أن يكون design أو execution" });

        var slug = await ResolveUniqueSlugAsync(db, dto.Slug, dto.Name);

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Type = dto.Type,
            OrderIndex = dto.OrderIndex,
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBySlug), new { slug = category.Slug }, new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Type = category.Type,
            OrderIndex = category.OrderIndex,
        });
    }

    // PUT /api/categories/{id} — admin only
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Type) && !AllowedTypes.Contains(dto.Type))
            return BadRequest(new { message = "النوع يجب أن يكون design أو execution" });

        if (!string.IsNullOrWhiteSpace(dto.Name)) category.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Type)) category.Type = dto.Type;
        if (dto.OrderIndex.HasValue) category.OrderIndex = dto.OrderIndex.Value;

        // Slug is left alone unless explicitly provided — changing it silently would
        // break any URL already pointing at this category (e.g. /works/execution/{slug}).
        if (!string.IsNullOrWhiteSpace(dto.Slug))
            category.Slug = await ResolveUniqueSlugAsync(db, dto.Slug, dto.Name, excludeId: id);

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/categories/{id} — admin only, only if no projects
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await db.Categories
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null) return NotFound();

        if (category.Projects.Count > 0)
            return BadRequest(new { message = "لا يمكن حذف تصنيف يحتوي على مشاريع" });

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
