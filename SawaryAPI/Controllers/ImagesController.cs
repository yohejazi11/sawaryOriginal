using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Projects;
using SawaryAPI.Helpers;
using SawaryAPI.Models;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Authorize]
public class ImagesController(AppDbContext db, LocalImageStorageService storage) : ControllerBase
{
    // POST /api/projects/{projectId}/images — upload 1-20 images, optionally into a section
    [HttpPost("api/projects/{projectId:int}/images")]
    [RequestSizeLimit(200 * 1024 * 1024)] // 200 MB total
    public async Task<IActionResult> Upload(int projectId, [FromForm] List<IFormFile> files, [FromForm] int? sectionId)
    {
        var project = await db.Projects.FindAsync(projectId);
        if (project is null) return NotFound();

        if (files.Count == 0) return BadRequest(new { message = "No files provided" });
        if (files.Count > 20) return BadRequest(new { message = "Maximum 20 images per upload" });

        if (sectionId.HasValue)
        {
            var sectionBelongsToProject = await db.ProjectSections
                .AnyAsync(s => s.Id == sectionId.Value && s.ProjectId == projectId);
            if (!sectionBelongsToProject) return BadRequest(new { message = "Section not found in this project" });
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var uploaded = new List<ProjectImageDto>();
        // Each section (and the ungrouped bucket) orders its images independently.
        var nextOrder = await db.ProjectImages
            .Where(i => i.ProjectId == projectId && i.SectionId == sectionId)
            .Select(i => (int?)i.OrderIndex)
            .MaxAsync() ?? -1;

        foreach (var file in files)
        {
            try
            {
                var relativePath = await storage.SaveImageAsync(file, project.Slug);
                var url = $"{baseUrl}/{relativePath}";
                nextOrder++;

                var ext = Path.GetExtension(file.FileName).TrimStart('.');
                (int Width, int Height)? dims;
                await using (var readStream = file.OpenReadStream())
                    dims = ImageDimensionReader.TryReadDimensions(readStream, ext);

                var image = new ProjectImage
                {
                    Url = url,
                    PublicId = relativePath,
                    Width = dims?.Width,
                    Height = dims?.Height,
                    OrderIndex = nextOrder,
                    ProjectId = projectId,
                    SectionId = sectionId,
                };
                db.ProjectImages.Add(image);
                await db.SaveChangesAsync();

                // Set as cover if project has no cover yet
                if (string.IsNullOrEmpty(project.CoverImageUrl))
                {
                    project.CoverImageUrl = url;
                    project.CoverImageWidth = dims?.Width;
                    project.CoverImageHeight = dims?.Height;
                    await db.SaveChangesAsync();
                }

                uploaded.Add(new ProjectImageDto
                {
                    Id = image.Id,
                    Url = image.Url,
                    PublicId = image.PublicId,
                    Width = image.Width,
                    Height = image.Height,
                    OrderIndex = image.OrderIndex,
                    SectionId = image.SectionId,
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message, file = file.FileName });
            }
        }

        return Ok(uploaded);
    }

    // DELETE /api/images/{id}
    [HttpDelete("api/images/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var image = await db.ProjectImages
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (image is null) return NotFound();

        if (!string.IsNullOrEmpty(image.PublicId))
        {
            try { storage.DeleteImage(image.PublicId); }
            catch { /* file deletion failure must not block DB deletion */ }
        }

        // Clear cover if this was the cover
        if (image.Project.CoverImageUrl == image.Url)
        {
            var next = await db.ProjectImages
                .Where(i => i.ProjectId == image.ProjectId && i.Id != id)
                .OrderBy(i => i.OrderIndex)
                .FirstOrDefaultAsync();
            image.Project.CoverImageUrl = next?.Url ?? string.Empty;
            image.Project.CoverImageWidth = next?.Width;
            image.Project.CoverImageHeight = next?.Height;
        }

        db.ProjectImages.Remove(image);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/images/{id}/order
    [HttpPatch("api/images/{id:int}/order")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var image = await db.ProjectImages.FindAsync(id);
        if (image is null) return NotFound();

        image.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/images/{id}/section — move an image into a section, or back to
    // ungrouped when SectionId is null.
    [HttpPatch("api/images/{id:int}/section")]
    public async Task<IActionResult> MoveToSection(int id, [FromBody] MoveImageToSectionDto dto)
    {
        var image = await db.ProjectImages.FindAsync(id);
        if (image is null) return NotFound();

        if (dto.SectionId.HasValue)
        {
            var sectionBelongsToProject = await db.ProjectSections
                .AnyAsync(s => s.Id == dto.SectionId.Value && s.ProjectId == image.ProjectId);
            if (!sectionBelongsToProject) return BadRequest(new { message = "Section not found in this project" });
        }

        image.SectionId = dto.SectionId;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/projects/{projectId}/cover
    [HttpPatch("api/projects/{projectId:int}/cover")]
    public async Task<IActionResult> SetCover(int projectId, [FromBody] SetCoverDto dto)
    {
        var project = await db.Projects.FindAsync(projectId);
        if (project is null) return NotFound();

        var image = await db.ProjectImages
            .FirstOrDefaultAsync(i => i.Id == dto.ImageId && i.ProjectId == projectId);
        if (image is null) return NotFound(new { message = "Image not found in this project" });

        project.CoverImageUrl = image.Url;
        project.CoverImageWidth = image.Width;
        project.CoverImageHeight = image.Height;
        await db.SaveChangesAsync();
        return Ok(new { coverImageUrl = project.CoverImageUrl });
    }
}

public class SetCoverDto
{
    public int ImageId { get; set; }
}
