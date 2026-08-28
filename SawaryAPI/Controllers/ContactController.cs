using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Contact;
using SawaryAPI.DTOs.Projects;
using SawaryAPI.Models;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/contact-settings")]
public partial class ContactController(AppDbContext db) : ControllerBase
{
    // Digits only, optional leading '+', 8–15 digits total (E.164-ish, not tied to one
    // specific country's format since this is a general-purpose validator).
    [GeneratedRegex(@"^\+?[0-9]{8,15}$")]
    private static partial Regex PhoneRegex();

    private async Task<ContactSettings> GetOrCreateAsync()
    {
        var settings = await db.ContactSettings
            .Include(c => c.PhoneNumbers.OrderBy(p => p.OrderIndex))
            .Include(c => c.SocialLinks.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync();

        if (settings is null)
        {
            settings = new ContactSettings();
            db.ContactSettings.Add(settings);
            await db.SaveChangesAsync();
        }

        return settings;
    }

    private static ContactSettingsDto MapToDto(ContactSettings c) => new()
    {
        WhatsAppNumber = c.WhatsAppNumber,
        Email = c.Email,
        PhoneNumbers = c.PhoneNumbers.Select(p => new ContactPhoneNumberDto
        {
            Id = p.Id,
            Number = p.Number,
            LabelAr = p.LabelAr,
            LabelEn = p.LabelEn,
            OrderIndex = p.OrderIndex,
        }).ToList(),
        SocialLinks = c.SocialLinks.Select(s => new SocialLinkDto
        {
            Id = s.Id,
            Platform = s.Platform,
            Url = s.Url,
            OrderIndex = s.OrderIndex,
        }).ToList(),
    };

    // GET /api/contact-settings — public
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await GetOrCreateAsync();
        return Ok(MapToDto(settings));
    }

    // PUT /api/contact-settings — admin only
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateContactSettingsDto dto)
    {
        var settings = await GetOrCreateAsync();

        if (dto.WhatsAppNumber is not null)
        {
            if (!PhoneRegex().IsMatch(dto.WhatsAppNumber))
                return BadRequest(new { message = "رقم واتساب غير صالح" });
            settings.WhatsAppNumber = dto.WhatsAppNumber;
        }

        if (dto.Email is not null)
        {
            if (!new EmailAddressAttribute().IsValid(dto.Email))
                return BadRequest(new { message = "البريد الإلكتروني غير صالح" });
            settings.Email = dto.Email;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Phone numbers ────────────────────────────────────────────────────────

    [Authorize]
    [HttpPost("phone-numbers")]
    public async Task<IActionResult> CreatePhoneNumber([FromBody] CreateContactPhoneNumberDto dto)
    {
        if (!PhoneRegex().IsMatch(dto.Number))
            return BadRequest(new { message = "رقم هاتف غير صالح" });

        var settings = await GetOrCreateAsync();
        var nextOrder = settings.PhoneNumbers.Count > 0 ? settings.PhoneNumbers.Max(p => p.OrderIndex) + 1 : 0;

        var phone = new ContactPhoneNumber
        {
            ContactSettingsId = settings.Id,
            Number = dto.Number,
            LabelAr = dto.LabelAr,
            LabelEn = dto.LabelEn,
            OrderIndex = nextOrder,
        };
        db.ContactPhoneNumbers.Add(phone);
        await db.SaveChangesAsync();

        return Ok(new ContactPhoneNumberDto { Id = phone.Id, Number = phone.Number, LabelAr = phone.LabelAr, LabelEn = phone.LabelEn, OrderIndex = phone.OrderIndex });
    }

    [Authorize]
    [HttpPut("phone-numbers/{id:int}")]
    public async Task<IActionResult> UpdatePhoneNumber(int id, [FromBody] UpdateContactPhoneNumberDto dto)
    {
        var phone = await db.ContactPhoneNumbers.FindAsync(id);
        if (phone is null) return NotFound();

        if (dto.Number is not null)
        {
            if (!PhoneRegex().IsMatch(dto.Number))
                return BadRequest(new { message = "رقم هاتف غير صالح" });
            phone.Number = dto.Number;
        }
        if (dto.LabelAr is not null) phone.LabelAr = dto.LabelAr;
        if (dto.LabelEn is not null) phone.LabelEn = dto.LabelEn;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("phone-numbers/{id:int}")]
    public async Task<IActionResult> DeletePhoneNumber(int id)
    {
        var phone = await db.ContactPhoneNumbers.FindAsync(id);
        if (phone is null) return NotFound();

        db.ContactPhoneNumbers.Remove(phone);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPatch("phone-numbers/{id:int}/order")]
    public async Task<IActionResult> UpdatePhoneNumberOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var phone = await db.ContactPhoneNumbers.FindAsync(id);
        if (phone is null) return NotFound();

        phone.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Social links ─────────────────────────────────────────────────────────

    [Authorize]
    [HttpPost("social-links")]
    public async Task<IActionResult> CreateSocialLink([FromBody] CreateSocialLinkDto dto)
    {
        if (!Uri.TryCreate(dto.Url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return BadRequest(new { message = "الرابط غير صالح" });

        var settings = await GetOrCreateAsync();
        var nextOrder = settings.SocialLinks.Count > 0 ? settings.SocialLinks.Max(s => s.OrderIndex) + 1 : 0;

        var link = new SocialLink
        {
            ContactSettingsId = settings.Id,
            Platform = dto.Platform,
            Url = dto.Url,
            OrderIndex = nextOrder,
        };
        db.SocialLinks.Add(link);
        await db.SaveChangesAsync();

        return Ok(new SocialLinkDto { Id = link.Id, Platform = link.Platform, Url = link.Url, OrderIndex = link.OrderIndex });
    }

    [Authorize]
    [HttpPut("social-links/{id:int}")]
    public async Task<IActionResult> UpdateSocialLink(int id, [FromBody] UpdateSocialLinkDto dto)
    {
        var link = await db.SocialLinks.FindAsync(id);
        if (link is null) return NotFound();

        if (dto.Url is not null)
        {
            if (!Uri.TryCreate(dto.Url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
                return BadRequest(new { message = "الرابط غير صالح" });
            link.Url = dto.Url;
        }
        if (dto.Platform is not null) link.Platform = dto.Platform;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("social-links/{id:int}")]
    public async Task<IActionResult> DeleteSocialLink(int id)
    {
        var link = await db.SocialLinks.FindAsync(id);
        if (link is null) return NotFound();

        db.SocialLinks.Remove(link);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPatch("social-links/{id:int}/order")]
    public async Task<IActionResult> UpdateSocialLinkOrder(int id, [FromBody] UpdateOrderDto dto)
    {
        var link = await db.SocialLinks.FindAsync(id);
        if (link is null) return NotFound();

        link.OrderIndex = dto.OrderIndex;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
