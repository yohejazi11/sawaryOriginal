using System.Text.RegularExpressions;

namespace SawaryAPI.Helpers;

public static class SlugHelper
{
    public static string Slugify(string name)
    {
        var slug = name.ToLowerInvariant().Trim();
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"[^a-z0-9-]", "");
        slug = Regex.Replace(slug, @"-+", "-").Trim('-');
        return string.IsNullOrEmpty(slug) ? Guid.NewGuid().ToString("N")[..8] : slug;
    }
}
