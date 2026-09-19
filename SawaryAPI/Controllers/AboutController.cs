using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.About;
using SawaryAPI.DTOs.Projects;
using SawaryAPI.Helpers;
using SawaryAPI.Models;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/about")]
public class AboutController(AppDbContext db) : ControllerBase
{
    // Self-initializing singleton — there is no migration-embedded seed row for a fresh
    // database in a lower environment; the real seed only exists via HasData on the
    // production model. If nothing exists yet, create one blank row for the admin to fill in.
    private async Task<AboutContent> GetOrCreateAsync()
    {
        var content = await db.AboutContent
            .Include(a => a.FaqItems.OrderBy(f => f.OrderIndex))
            .Include(a => a.StatItems.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync();

        if (content is null)
        {
            content = new AboutContent();
            db.AboutContent.Add(content);
            await db.SaveChangesAsync();
        }

        return content;
    }

    private static AboutContentDto MapToDto(AboutContent a) => new()
    {
        HeroTitleAr = a.HeroTitleAr,
        HeroTitleEn = a.HeroTitleEn,
        HeroStatementAr = a.HeroStatementAr,
        HeroStatementEn = a.HeroStatementEn,
        HeroScrollHintAr = a.HeroScrollHintAr,
        HeroScrollHintEn = a.HeroScrollHintEn,
        VisionTitleAr = a.VisionTitleAr,
        VisionTitleEn = a.VisionTitleEn,
        VisionBodyAr = a.VisionBodyAr,
        VisionBodyEn = a.VisionBodyEn,
        TeamTitleAr = a.TeamTitleAr,
        TeamTitleEn = a.TeamTitleEn,
        TeamImageAltAr = a.TeamImageAltAr,
        TeamImageAltEn = a.TeamImageAltEn,
        TeamPhotoUrl = a.TeamPhotoUrl,
        TeamPhotoWidth = a.TeamPhotoWidth,
        TeamPhotoHeight = a.TeamPhotoHeight,
        FaqTitleAr = a.FaqTitleAr,
        FaqTitleEn = a.FaqTitleEn,
        LocationTitleAr = a.LocationTitleAr,
        LocationTitleEn = a.LocationTitleEn,
        LocationAddressAr = a.LocationAddressAr,
        LocationAddressEn = a.LocationAddressEn,
        LocationMapTitleAr = a.LocationMapTitleAr,
        LocationMapTitleEn = a.LocationMapTitleEn,
        LocationMapComingSoonAr = a.LocationMapComingSoonAr,
        LocationMapComingSoonEn = a.LocationMapComingSoonEn,
        LocationGalleryAltAr = a.LocationGalleryAltAr,
        LocationGalleryAltEn = a.LocationGalleryAltEn,
        SectionLabelWhoWeAreAr = a.SectionLabelWhoWeAreAr,
        SectionLabelWhoWeAreEn = a.SectionLabelWhoWeAreEn,
        SectionLabelTeamStructureAr = a.SectionLabelTeamStructureAr,
        SectionLabelTeamStructureEn = a.SectionLabelTeamStructureEn,
        SectionLabelFaqAr = a.SectionLabelFaqAr,
        SectionLabelFaqEn = a.SectionLabelFaqEn,
        SectionLabelVisitUsAr = a.SectionLabelVisitUsAr,
        SectionLabelVisitUsEn = a.SectionLabelVisitUsEn,
        SectionLabelStatsAr = a.SectionLabelStatsAr,
        SectionLabelStatsEn = a.SectionLabelStatsEn,
        FaqItems = a.FaqItems.Select(f => new AboutFaqItemDto
        {
            Id = f.Id,
            QuestionAr = f.QuestionAr,
            QuestionEn = f.QuestionEn,
            AnswerAr = f.AnswerAr,
            AnswerEn = f.AnswerEn,
            ActionLabelAr = f.ActionLabelAr,
            ActionLabelEn = f.ActionLabelEn,
            ActionHref = f.ActionHref,
            OrderIndex = f.OrderIndex,
        }).ToList(),
        StatItems = a.StatItems.Select(s => new AboutStatItemDto
        {
            Id = s.Id,
            LabelAr = s.LabelAr,
            LabelEn = s.LabelEn,
            Value = s.Value,
            Suffix = s.Suffix,
            OrderIndex = s.OrderIndex,
        }).ToList(),
    };

    // GET /api/about — public
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var content = await GetOrCreateAsync();
        return Ok(MapToDto(content));
    }

    // PUT /api/about — admin only
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateAboutContentDto dto)
    {
        var content = await GetOrCreateAsync();

        if (dto.HeroTitleAr is not null) content.HeroTitleAr = dto.HeroTitleAr;
        if (dto.HeroTitleEn is not null) content.HeroTitleEn = dto.HeroTitleEn;
        if (dto.HeroStatementAr is not null) content.HeroStatementAr = dto.HeroStatementAr;
        if (dto.HeroStatementEn is not null) content.HeroStatementEn = dto.HeroStatementEn;
        if (dto.HeroScrollHintAr is not null) content.HeroScrollHintAr = dto.HeroScrollHintAr;
        if (dto.HeroScrollHintEn is not null) content.HeroScrollHintEn = dto.HeroScrollHintEn;

        if (dto.VisionTitleAr is not null) content.VisionTitleAr = dto.VisionTitleAr;
        if (dto.VisionTitleEn is not null) content.VisionTitleEn = dto.VisionTitleEn;
        if (dto.VisionBodyAr is not null) content.VisionBodyAr = dto.VisionBodyAr;
        if (dto.VisionBodyEn is not null) content.VisionBodyEn = dto.VisionBodyEn;

        if (dto.TeamTitleAr is not null) content.TeamTitleAr = dto.TeamTitleAr;
        if (dto.TeamTitleEn is not null) content.TeamTitleEn = dto.TeamTitleEn;
        if (dto.TeamImageAltAr is not null) content.TeamImageAltAr = dto.TeamImageAltAr;
        if (dto.TeamImageAltEn is not null) content.TeamImageAltEn = dto.TeamImageAltEn;

        if (dto.FaqTitleAr is not null) content.FaqTitleAr = dto.FaqTitleAr;
        if (dto.FaqTitleEn is not null) content.FaqTitleEn = dto.FaqTitleEn;

        if (dto.LocationTitleAr is not null) content.LocationTitleAr = dto.LocationTitleAr;
        if (dto.LocationTitleEn is not null) content.LocationTitleEn = dto.LocationTitleEn;
        if (dto.LocationAddressAr is not null) content.LocationAddressAr = dto.LocationAddressAr;
        if (dto.LocationAddressEn is not null) content.LocationAddressEn = dto.LocationAddressEn;
        if (dto.LocationMapTitleAr is not null) content.LocationMapTitleAr = dto.LocationMapTitleAr;
        if (dto.LocationMapTitleEn is not null) content.LocationMapTitleEn = dto.LocationMapTitleEn;
        if (dto.LocationMapComingSoonAr is not null) content.LocationMapComingSoonAr = dto.LocationMapComingSoonAr;
        if (dto.LocationMapComingSoonEn is not null) content.LocationMapComingSoonEn = dto.LocationMapComingSoonEn;
        if (dto.LocationGalleryAltAr is not null) content.LocationGalleryAltAr = dto.LocationGalleryAltAr;
        if (dto.LocationGalleryAltEn is not null) content.LocationGalleryAltEn = dto.LocationGalleryAltEn;

        if (dto.SectionLabelWhoWeAreAr is not null) content.SectionLabelWhoWeAreAr = dto.SectionLabelWhoWeAreAr;
        if (dto.SectionLabelWhoWeAreEn is not null) content.SectionLabelWhoWeAreEn = dto.SectionLabelWhoWeAreEn;
        if (dto.SectionLabelTeamStructureAr is not null) content.SectionLabelTeamStructureAr = dto.SectionLabelTeamStructureAr;
        if (dto.SectionLabelTeamStructureEn is not null) content.SectionLabelTeamStructureEn = dto.SectionLabelTeamStructureEn;
        if (dto.SectionLabelFaqAr is not null) content.SectionLabelFaqAr = dto.SectionLabelFaqAr;
        if (dto.SectionLabelFaqEn is not null) content.SectionLabelFaqEn = dto.SectionLabelFaqEn;
        if (dto.SectionLabelVisitUsAr is not null) content.SectionLabelVisitUsAr = dto.SectionLabelVisitUsAr;
        if (dto.SectionLabelVisitUsEn is not null) content.SectionLabelVisitUsEn = dto.SectionLabelVisitUsEn;
        if (dto.SectionLabelStatsAr is not null) content.SectionLabelStatsAr = dto.SectionLabelStatsAr;
        if (dto.SectionLabelStatsEn is not null) content.SectionLabelStatsEn = dto.SectionLabelStatsEn;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/about/team-photo — admin only, multipart, form key "image"
    [Authorize]
    [HttpPost("team-photo")]
    [RequestSizeLimit(LocalImageStorageService.MaxBytes)]
    public async Task<IActionResult> UploadTeamPhoto(
        IFormFile image,
        [FromServices] LocalImageStorageService storage)
    {
        var content = await GetOrCreateAsync();

        string relativePath;
        try
        {
            relativePath = await storage.SaveImageAsync(image, "about");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var oldPublicId = content.TeamPhotoPublicId;

        var ext = Path.GetExtension(image.FileName).TrimStart('.');
        (int Width, int Height)? dims;
        await using (var stream = image.OpenReadStream())
            dims = ImageDimensionReader.TryReadDimensions(stream, ext);

        content.TeamPhotoUrl = $"{Request.Scheme}://{Request.Host}/{relativePath}";
        content.TeamPhotoPublicId = relativePath;
        content.TeamPhotoWidth = dims?.Width;
        content.TeamPhotoHeight = dims?.Height;
        await db.SaveChangesAsync();

        // Only ever a backend-managed upload path — the seeded default points at a
        // frontend static asset, which must never be deleted from wwwroot/uploads.
        if (!string.IsNullOrEmpty(oldPublicId))
        {
            try { storage.DeleteImage(oldPublicId); }
            catch { /* file deletion failure must not block the update */ }
        }

        return Ok(new { teamPhotoUrl = content.TeamPhotoUrl, width = content.TeamPhotoWidth, height = content.TeamPhotoHeight });
    }

    // ── FAQ items ────────────────────────────────────────────────────────────

    // POST /api/about/faq-items — admin only
    [Authorize]
    [HttpPost("faq-items")]
    public async Task<IActionResult> CreateFaqItem([FromBody] CreateAboutFaqItemDto dto)
    {
        var about = await GetOrCreateAsync();
        var nextOrder = about.FaqItems.Count > 0 ? about.FaqItems.Max(f => f.OrderIndex) + 1 : 0;

        var item = new AboutFaqItem
        {
            AboutContentId = about.Id,
            QuestionAr = dto.QuestionAr,
            QuestionEn = dto.QuestionEn,
            AnswerAr = dto.AnswerAr,
            AnswerEn = dto.AnswerEn,
            ActionLabelAr = dto.ActionLabelAr,
            ActionLabelEn = dto.ActionLabelEn,
            ActionHref = dto.ActionHref,
            OrderIndex = nextOrder,
        };
        db.AboutFaqItems.Add(item);
        await db.SaveChangesAsync();

        return Ok(new AboutFaqItemDto
        {
            Id = item.Id,
            QuestionAr = item.QuestionAr,
            QuestionEn = item.QuestionEn,
            AnswerAr = item.AnswerAr,
            AnswerEn = item.AnswerEn,
            ActionLabelAr = item.ActionLabelAr,
            ActionLabelEn = item.ActionLabelEn,
            ActionHref = item.ActionHref,
            OrderIndex = item.OrderIndex,
        });
    }

    // PUT /api/about/faq-items/{id} — admin only
    [Authorize]
    [HttpPut("faq-items/{id:int}")]
    public async Task<IActionResult> UpdateFaqItem(int id, [FromBody] UpdateAboutFaqItemDto dto)
    {
        var item = await db.AboutFaqItems.FindAsync(id);
        if (item is null) return NotFound();

        if (dto.QuestionAr is not null) item.QuestionAr = dto.QuestionAr;
        if (dto.QuestionEn is not null) item.QuestionEn = dto.QuestionEn;
        if (dto.AnswerAr is not null) item.AnswerAr = dto.AnswerAr;
        if (dto.AnswerEn is not null) item.AnswerEn = dto.AnswerEn;
        if (dto.ActionLabelAr is not null) item.ActionLabelAr = dto.ActionLabelAr;
        if (dto.ActionLabelEn is not null) item.ActionLabelEn = dto.ActionLabelEn;
        if (dto.ActionHref is not null) item.ActionHref = dto.ActionHref;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/about/faq-items/{id} — admin only
    [Authorize]
    [HttpDelete("faq-items/{id:int}")]
    public async Task<IActionResult> DeleteFaqItem(int id)
    {
        var item = await db.AboutFaqItems.FindAsync(id);
        if (item is null) return NotFound();

        db.AboutFaqItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/about/faq-items/{id}/order — admin only
    [Authorize]
    [HttpPatch("faq-items/{id:int}/order")]
    public async Task<IActionResult> UpdateFaqItemOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var item = await db.AboutFaqItems.FindAsync(id);
        if (item is null) return NotFound();

        item.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Stat items ───────────────────────────────────────────────────────────

    // POST /api/about/stat-items — admin only
    [Authorize]
    [HttpPost("stat-items")]
    public async Task<IActionResult> CreateStatItem([FromBody] CreateAboutStatItemDto dto)
    {
        var about = await GetOrCreateAsync();
        var nextOrder = about.StatItems.Count > 0 ? about.StatItems.Max(s => s.OrderIndex) + 1 : 0;

        var item = new AboutStatItem
        {
            AboutContentId = about.Id,
            LabelAr = dto.LabelAr,
            LabelEn = dto.LabelEn,
            Value = dto.Value,
            Suffix = dto.Suffix,
            OrderIndex = nextOrder,
        };
        db.AboutStatItems.Add(item);
        await db.SaveChangesAsync();

        return Ok(new AboutStatItemDto
        {
            Id = item.Id,
            LabelAr = item.LabelAr,
            LabelEn = item.LabelEn,
            Value = item.Value,
            Suffix = item.Suffix,
            OrderIndex = item.OrderIndex,
        });
    }

    // PUT /api/about/stat-items/{id} — admin only
    [Authorize]
    [HttpPut("stat-items/{id:int}")]
    public async Task<IActionResult> UpdateStatItem(int id, [FromBody] UpdateAboutStatItemDto dto)
    {
        var item = await db.AboutStatItems.FindAsync(id);
        if (item is null) return NotFound();

        if (dto.LabelAr is not null) item.LabelAr = dto.LabelAr;
        if (dto.LabelEn is not null) item.LabelEn = dto.LabelEn;
        if (dto.Value.HasValue) item.Value = dto.Value.Value;
        if (dto.Suffix is not null) item.Suffix = dto.Suffix;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/about/stat-items/{id} — admin only
    [Authorize]
    [HttpDelete("stat-items/{id:int}")]
    public async Task<IActionResult> DeleteStatItem(int id)
    {
        var item = await db.AboutStatItems.FindAsync(id);
        if (item is null) return NotFound();

        db.AboutStatItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/about/stat-items/{id}/order — admin only
    [Authorize]
    [HttpPatch("stat-items/{id:int}/order")]
    public async Task<IActionResult> UpdateStatItemOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var item = await db.AboutStatItems.FindAsync(id);
        if (item is null) return NotFound();

        item.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
