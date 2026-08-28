namespace SawaryAPI.Models;

public class Category
{
    public int Id { get; set; }

    // Free-text display label — any language, shown as-is in the admin UI and used
    // as a raw fallback on the frontend. Do NOT rely on this for matching/routing —
    // that's what Slug is for. (Historically this field's comment suggested Arabic
    // display text like "تنفيذ تجاري", which is fine for display, but the frontend's
    // translation dictionary and hardcoded category routes match on Slug, not Name.)
    public string Name { get; set; } = string.Empty;

    // Stable, URL-safe, language-neutral identifier. Auto-generated from Name on
    // create (or explicitly set — see CreateCategoryDto.Slug) and never changes on
    // its own afterwards. The frontend's category-name translation dictionary
    // (lib/categoryLabels.ts) and the dedicated /works/execution/{residential,commercial}
    // routes match against this value — it must stay exactly "commercial"/"residential"
    // for those built-in category slots to keep working.
    public string Slug { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;       // "design" | "execution"
    public int OrderIndex { get; set; }
    public ICollection<Project> Projects { get; set; } = [];
}
