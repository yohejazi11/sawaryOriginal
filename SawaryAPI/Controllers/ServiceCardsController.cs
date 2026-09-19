using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Services;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/service-cards")]
[Authorize]
public class ServiceCardsController(AppDbContext db) : ControllerBase
{
    // PUT /api/service-cards/{id} — admin only
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCardDto dto)
    {
        var card = await db.ServiceCards.FindAsync(id);
        if (card is null) return NotFound();

        if (dto.Title is not null) card.Title = dto.Title;
        if (dto.OrderIndex.HasValue) card.OrderIndex = dto.OrderIndex.Value;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/service-cards/{id} — admin only
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromServices] LocalImageStorageService storage)
    {
        var card = await db.ServiceCards.FindAsync(id);
        if (card is null) return NotFound();

        if (!string.IsNullOrEmpty(card.PublicId))
        {
            try { storage.DeleteImage(card.PublicId); }
            catch { /* file deletion failure must not block DB deletion */ }
        }

        db.ServiceCards.Remove(card);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
