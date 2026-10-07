using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Blog;
using SawaryAPI.Helpers;
using SawaryAPI.Models;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/blog")]
public class BlogController(AppDbContext db) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase) { "jpg", "jpeg", "png", "webp" };
    private const long MaxFileSize = LocalImageStorageService.MaxBytes;

    private static T Fill<T>(T dto, BlogPost p) where T : BlogPostListDto
    {
        dto.Id = p.Id;
        dto.TitleAr = p.TitleAr;
        dto.TitleEn = p.TitleEn;
        dto.Slug = p.Slug;
        dto.ExcerptAr = p.ExcerptAr;
        dto.ExcerptEn = p.ExcerptEn;
        dto.CoverImageUrl = p.CoverImageUrl;
        dto.IsPublished = p.IsPublished;
        dto.PublishedAt = p.PublishedAt;
        dto.CreatedAt = p.CreatedAt;
        dto.UpdatedAt = p.UpdatedAt;
        return dto;
    }

    private static BlogPostListDto MapList(BlogPost p) => Fill(new BlogPostListDto(), p);

    private static BlogPostDto MapFull(BlogPost p)
    {
        var dto = Fill(new BlogPostDto(), p);
        dto.ContentAr = p.ContentAr;
        dto.ContentEn = p.ContentEn;
        dto.CoverImageWidth = p.CoverImageWidth;
        dto.CoverImageHeight = p.CoverImageHeight;
        return dto;
    }

    // Slugifies the requested slug (or the English title) and appends -2, -3… until unique.
    private async Task<string> UniqueSlugAsync(string source, int? excludeId = null)
    {
        var baseSlug = SlugHelper.Slugify(source);
        var slug = baseSlug;
        var suffix = 2;
        while (await db.BlogPosts.AnyAsync(b => b.Slug == slug && b.Id != excludeId))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }
        return slug;
    }

    // GET /api/blog — public, published posts only, newest first
    [HttpGet]
    public async Task<IActionResult> GetPublished()
    {
        var posts = await db.BlogPosts
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.PublishedAt)
            .ToListAsync();

        return Ok(posts.Select(MapList));
    }

    // GET /api/blog/{slug} — public, published posts only
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var post = await db.BlogPosts.FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished);
        if (post is null) return NotFound();
        return Ok(MapFull(post));
    }

    // GET /api/blog/admin — admin only, drafts included
    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var posts = await db.BlogPosts
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(posts.Select(MapList));
    }

    // GET /api/blog/admin/{id} — admin only, drafts included
    [Authorize]
    [HttpGet("admin/{id:int}")]
    public async Task<IActionResult> GetByIdForAdmin(int id)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();
        return Ok(MapFull(post));
    }

    // POST /api/blog — admin only
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostDto dto)
    {
        var now = DateTime.UtcNow;
        var post = new BlogPost
        {
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            Slug = await UniqueSlugAsync(string.IsNullOrWhiteSpace(dto.Slug) ? dto.TitleEn : dto.Slug),
            ExcerptAr = dto.ExcerptAr,
            ExcerptEn = dto.ExcerptEn,
            ContentAr = dto.ContentAr,
            ContentEn = dto.ContentEn,
            IsPublished = dto.IsPublished,
            PublishedAt = dto.IsPublished ? now : null,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.BlogPosts.Add(post);
        await db.SaveChangesAsync();
        return Ok(MapFull(post));
    }

    // PUT /api/blog/{id} — admin only
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBlogPostDto dto)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.TitleAr)) post.TitleAr = dto.TitleAr.Trim();
        if (!string.IsNullOrWhiteSpace(dto.TitleEn)) post.TitleEn = dto.TitleEn.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug != post.Slug)
            post.Slug = await UniqueSlugAsync(dto.Slug, post.Id);
        if (dto.ExcerptAr is not null) post.ExcerptAr = dto.ExcerptAr;
        if (dto.ExcerptEn is not null) post.ExcerptEn = dto.ExcerptEn;
        if (!string.IsNullOrWhiteSpace(dto.ContentAr)) post.ContentAr = dto.ContentAr;
        if (dto.ContentEn is not null) post.ContentEn = dto.ContentEn;
        if (dto.IsPublished.HasValue)
        {
            // Stamp the publish date the first time a post goes live; keep it on re-publish.
            if (dto.IsPublished.Value && post.PublishedAt is null) post.PublishedAt = DateTime.UtcNow;
            post.IsPublished = dto.IsPublished.Value;
        }
        post.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(MapFull(post));
    }

    // DELETE /api/blog/{id} — admin only
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromServices] LocalImageStorageService storage)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();

        var publicId = post.CoverImagePublicId;
        db.BlogPosts.Remove(post);
        await db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(publicId))
        {
            try { storage.DeleteImage(publicId); }
            catch { /* file deletion failure must not block the delete */ }
        }

        return NoContent();
    }

    // POST /api/blog/{id}/cover — admin only, multipart form key "image"
    [Authorize]
    [HttpPost("{id:int}/cover")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> UploadCover(int id, IFormFile image, [FromServices] LocalImageStorageService storage)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();

        var ext = Path.GetExtension(image.FileName).TrimStart('.').ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext)) return BadRequest(new { message = "Invalid file type" });
        if (image.Length > MaxFileSize) return BadRequest(new { message = "File too large" });

        (int Width, int Height)? dims;
        await using (var stream = image.OpenReadStream())
            dims = ImageDimensionReader.TryReadDimensions(stream, ext);

        var relativePath = await storage.SaveImageAsync(image, "blog");
        var url = $"{Request.Scheme}://{Request.Host}/{relativePath}";
        var oldPublicId = post.CoverImagePublicId;

        post.CoverImageUrl = url;
        post.CoverImagePublicId = relativePath;
        post.CoverImageWidth = dims?.Width;
        post.CoverImageHeight = dims?.Height;
        post.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(oldPublicId))
        {
            try { storage.DeleteImage(oldPublicId); }
            catch { /* file deletion failure must not block the update */ }
        }

        return Ok(new { coverImageUrl = url });
    }
}
