using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Projects;
using SawaryAPI.Models;

namespace SawaryAPI.Controllers;

[ApiController]
public class ProjectSectionsController(AppDbContext db) : ControllerBase
{
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

    private static ProjectSectionDto MapSection(ProjectSection s) => new()
    {
        Id = s.Id,
        NameAr = s.NameAr,
        NameEn = s.NameEn,
        OrderIndex = s.OrderIndex,
        Images = s.Images.Select(MapImage).ToList(),
    };

    // GET /api/projects/{projectId}/sections — public
    [HttpGet("api/projects/{projectId:int}/sections")]
    public async Task<IActionResult> GetAllForProject(int projectId)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId)) return NotFound();

        var sections = await db.ProjectSections
            .Where(s => s.ProjectId == projectId)
            .Include(s => s.Images.OrderBy(i => i.OrderIndex))
            .OrderBy(s => s.OrderIndex)
            .ToListAsync();

        return Ok(sections.Select(MapSection));
    }

    // POST /api/projects/{projectId}/sections — admin only
    [Authorize]
    [HttpPost("api/projects/{projectId:int}/sections")]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateProjectSectionDto dto)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId)) return NotFound();

        var orderIndex = dto.OrderIndex;
        if (!orderIndex.HasValue)
        {
            var max = await db.ProjectSections
                .Where(s => s.ProjectId == projectId)
                .Select(s => (int?)s.OrderIndex)
                .MaxAsync() ?? -1;
            orderIndex = max + 1;
        }

        var section = new ProjectSection
        {
            NameAr = dto.NameAr,
            NameEn = dto.NameEn,
            OrderIndex = orderIndex.Value,
            ProjectId = projectId,
        };

        db.ProjectSections.Add(section);
        await db.SaveChangesAsync();

        return Ok(new ProjectSectionDto
        {
            Id = section.Id,
            NameAr = section.NameAr,
            NameEn = section.NameEn,
            OrderIndex = section.OrderIndex,
        });
    }

    // PUT /api/sections/{id} — admin only
    [Authorize]
    [HttpPut("api/sections/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectSectionDto dto)
    {
        var section = await db.ProjectSections.FindAsync(id);
        if (section is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.NameAr)) section.NameAr = dto.NameAr;
        if (!string.IsNullOrWhiteSpace(dto.NameEn)) section.NameEn = dto.NameEn;
        if (dto.OrderIndex.HasValue) section.OrderIndex = dto.OrderIndex.Value;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/sections/{id} — admin only. Its images demote to "ungrouped" rather
    // than being deleted. Done as an explicit bulk update (not a DB-level ON DELETE
    // SET NULL) because SQL Server rejects a second cascade path into ProjectImages
    // alongside Project -> ProjectImages CASCADE.
    [Authorize]
    [HttpDelete("api/sections/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var section = await db.ProjectSections.FindAsync(id);
        if (section is null) return NotFound();

        await db.ProjectImages
            .Where(i => i.SectionId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.SectionId, (int?)null));

        db.ProjectSections.Remove(section);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/sections/{id}/order — admin only
    [Authorize]
    [HttpPatch("api/sections/{id:int}/order")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var section = await db.ProjectSections.FindAsync(id);
        if (section is null) return NotFound();

        section.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
