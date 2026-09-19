namespace SawaryAPI.Models;

// Replaces the old single-per-project Category: a project can now carry any number
// of tags (many-to-many via ProjectTag). Bilingual name so the admin can create any
// tag freely without needing a frontend translation-dictionary entry for it.
public class Tag
{
    public int Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;

    // Stable, URL-safe identifier. The seeded starter tags ("commercial", "residential",
    // "design") are load-bearing — the public Services pages fetch projects by these
    // exact slugs (see ProjectsController / lib/projects.ts getProjectsByTagSlug).
    public string Slug { get; set; } = string.Empty;

    public int OrderIndex { get; set; }
    public ICollection<ProjectTag> ProjectTags { get; set; } = [];
}
