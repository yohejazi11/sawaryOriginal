using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Projects;
using SawaryAPI.DTOs.Tags;
using SawaryAPI.Helpers;
using SawaryAPI.Models;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    private static TagDto MapTag(Tag t) => new()
    {
        Id = t.Id,
        NameAr = t.NameAr,
        NameEn = t.NameEn,
        Slug = t.Slug,
        OrderIndex = t.OrderIndex,
    };

    // GET /api/projects?tagId={id}&featured=true — public
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? tagId,
        [FromQuery] bool? featured)
    {
        var query = db.Projects
            .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Images)
            .AsQueryable();

        if (tagId.HasValue)
            query = query.Where(p => p.ProjectTags.Any(pt => pt.TagId == tagId.Value));

        if (featured.HasValue)
            query = query.Where(p => p.IsFeatured == featured.Value);

        var projects = await query
            .OrderBy(p => p.OrderIndex)
            .ThenByDescending(p => p.CreatedAt)
            .Select(p => new ProjectListDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Location = p.Location,
                Year = p.Year,
                IsFeatured = p.IsFeatured,
                OrderIndex = p.OrderIndex,
                CoverImageUrl = p.CoverImageUrl,
                CoverImageWidth = p.CoverImageWidth,
                CoverImageHeight = p.CoverImageHeight,
                ImageCount = p.Images.Count,
                Tags = p.ProjectTags.Select(pt => new TagDto
                {
                    Id = pt.Tag.Id,
                    NameAr = pt.Tag.NameAr,
                    NameEn = pt.Tag.NameEn,
                    Slug = pt.Tag.Slug,
                    OrderIndex = pt.Tag.OrderIndex,
                }).OrderBy(t => t.OrderIndex).ToList(),
            })
            .ToListAsync();

        return Ok(projects);
    }

    // GET /api/projects/{id:int} — public, fetch by numeric ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await LoadFullProject(p => p.Id == id);
        if (project is null) return NotFound();
        return Ok(MapToDto(project));
    }

    // GET /api/projects/{slug} — public, fetch by slug (kept for backward compat)
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var project = await LoadFullProject(p => p.Slug == slug);
        if (project is null) return NotFound();
        return Ok(MapToDto(project));
    }

    private async Task<Project?> LoadFullProject(System.Linq.Expressions.Expression<Func<Project, bool>> predicate)
    {
        return await db.Projects
            .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Images.OrderBy(i => i.OrderIndex))
            .Include(p => p.Sections.OrderBy(s => s.OrderIndex)).ThenInclude(s => s.Images.OrderBy(i => i.OrderIndex))
            .FirstOrDefaultAsync(predicate);
    }

    // POST /api/projects — admin only
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var tagIds = dto.TagIds.Distinct().ToList();
        if (tagIds.Count > 0)
        {
            var foundCount = await db.Tags.CountAsync(t => tagIds.Contains(t.Id));
            if (foundCount != tagIds.Count)
                return BadRequest(new { message = "One or more tags not found" });
        }

        var baseSlug = SlugHelper.Slugify(dto.Name);
        var slug = baseSlug;
        var suffix = 2;
        while (await db.Projects.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        var project = new Project
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            Location = dto.Location,
            Year = dto.Year,
            CreatedAt = DateTime.UtcNow,
            ProjectTags = tagIds.Select(id => new ProjectTag { TagId = id }).ToList(),
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var created = await LoadFullProject(p => p.Id == project.Id);
        return CreatedAtAction(nameof(GetBySlug), new { slug = created!.Slug }, MapToDto(created));
    }

    // PUT /api/projects/{id} — admin only
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        var project = await db.Projects.Include(p => p.ProjectTags).FirstOrDefaultAsync(p => p.Id == id);
        if (project is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Name)) project.Name = dto.Name;
        if (dto.Description is not null) project.Description = dto.Description;
        if (dto.Location is not null) project.Location = dto.Location;
        if (dto.Year is not null) project.Year = dto.Year;

        if (dto.TagIds is not null)
        {
            var tagIds = dto.TagIds.Distinct().ToList();
            if (tagIds.Count > 0)
            {
                var foundCount = await db.Tags.CountAsync(t => tagIds.Contains(t.Id));
                if (foundCount != tagIds.Count)
                    return BadRequest(new { message = "One or more tags not found" });
            }

            project.ProjectTags.Clear();
            foreach (var tagId in tagIds)
                project.ProjectTags.Add(new ProjectTag { ProjectId = id, TagId = tagId });
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/projects/{id} — admin only
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromServices] Services.LocalImageStorageService storage)
    {
        var project = await db.Projects
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null) return NotFound();

        foreach (var img in project.Images.Where(i => !string.IsNullOrEmpty(i.PublicId)))
        {
            try { storage.DeleteImage(img.PublicId); }
            catch { /* file deletion failure must not block DB deletion */ }
        }

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/projects/{id}/featured — admin only
    [Authorize]
    [HttpPatch("{id:int}/featured")]
    public async Task<IActionResult> ToggleFeatured(int id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return NotFound();

        project.IsFeatured = !project.IsFeatured;
        await db.SaveChangesAsync();
        return Ok(new { isFeatured = project.IsFeatured });
    }

    // PATCH /api/projects/{id}/order — admin only
    [Authorize]
    [HttpPatch("{id:int}/order")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return NotFound();

        project.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/projects/backfill-image-dimensions — admin only, one-time/idempotent.
    // Reads width/height for every image whose dimensions are still missing (uploaded
    // before this feature existed) straight from the files already on disk.
    [Authorize]
    [HttpPost("backfill-image-dimensions")]
    public async Task<IActionResult> BackfillImageDimensions([FromServices] IWebHostEnvironment env)
    {
        var updated = 0;
        var failed = 0;

        var images = await db.ProjectImages
            .Where(i => i.Width == null || i.Height == null)
            .Include(i => i.Project)
            .ToListAsync();

        foreach (var image in images)
        {
            var dims = ReadDimensionsFromDisk(env, image.PublicId);
            if (dims is null) { failed++; continue; }

            image.Width = dims.Value.Width;
            image.Height = dims.Value.Height;

            if (image.Project.CoverImageUrl == image.Url)
            {
                image.Project.CoverImageWidth = dims.Value.Width;
                image.Project.CoverImageHeight = dims.Value.Height;
            }

            updated++;
        }

        await db.SaveChangesAsync();
        return Ok(new { updated, failed, total = images.Count });
    }

    private static (int Width, int Height)? ReadDimensionsFromDisk(IWebHostEnvironment env, string publicId)
    {
        if (string.IsNullOrEmpty(publicId)) return null;

        var fullPath = Path.Combine(env.WebRootPath, publicId.Replace('/', Path.DirectorySeparatorChar));
        if (!System.IO.File.Exists(fullPath)) return null;

        var ext = Path.GetExtension(fullPath).TrimStart('.');
        using var stream = System.IO.File.OpenRead(fullPath);
        return Helpers.ImageDimensionReader.TryReadDimensions(stream, ext);
    }

    private static ProjectImageDto MapImage(ProjectImage i) => new()
    {
        Id = i.Id,
        Url = i.Url,
        PublicId = i.PublicId,
        Width = i.Width,
        Height = i.Height,
        OrderIndex = i.OrderIndex,
        SectionId = i.SectionId,
    };

    private static ProjectDto MapToDto(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Description = p.Description,
        Location = p.Location,
        Year = p.Year,
        IsFeatured = p.IsFeatured,
        OrderIndex = p.OrderIndex,
        CreatedAt = p.CreatedAt,
        CoverImageUrl = p.CoverImageUrl,
        CoverImageWidth = p.CoverImageWidth,
        CoverImageHeight = p.CoverImageHeight,
        Tags = p.ProjectTags.Select(pt => MapTag(pt.Tag)).OrderBy(t => t.OrderIndex).ToList(),
        // Ungrouped images only — images belonging to a section are nested under it below.
        Images = p.Images.Where(i => i.SectionId == null).Select(MapImage).ToList(),
        Sections = p.Sections.Select(s => new ProjectSectionDto
        {
            Id = s.Id,
            NameAr = s.NameAr,
            NameEn = s.NameEn,
            OrderIndex = s.OrderIndex,
            Images = s.Images.Select(MapImage).ToList(),
        }).ToList(),
    };
}
