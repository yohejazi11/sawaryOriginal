namespace SawaryAPI.Services;

public class LocalImageStorageService(IWebHostEnvironment env)
{
    private static readonly HashSet<string> _allowed = ["jpg", "jpeg", "png", "webp"];
    private const long MaxBytes = 10 * 1024 * 1024; // 10 MB

    // Saves the file under wwwroot/uploads/{folder}/ and returns its path relative to wwwroot
    // (e.g. "uploads/villa-project/3f2a1b...jpg"), which is also its public URL path.
    public async Task<string> SaveImageAsync(IFormFile file, string folder)
    {
        var ext = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
        if (!_allowed.Contains(ext))
            throw new ArgumentException($"File type .{ext} is not allowed. Use jpg, jpeg, png or webp.");

        if (file.Length > MaxBytes)
            throw new ArgumentException("File size exceeds the 10 MB limit.");

        var fileName = $"{Guid.NewGuid():N}.{ext}";
        var folderPath = Path.Combine(env.WebRootPath, "uploads", folder);
        Directory.CreateDirectory(folderPath);

        var filePath = Path.Combine(folderPath, fileName);
        await using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        return $"uploads/{folder}/{fileName}";
    }

    // relativePath is the value returned by SaveImageAsync (path relative to wwwroot)
    public void DeleteImage(string relativePath)
    {
        var fullPath = Path.Combine(env.WebRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath)) File.Delete(fullPath);
    }
}
