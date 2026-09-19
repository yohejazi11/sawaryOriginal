namespace SawaryAPI.Models;

// Singleton row — always Id = 1. Site-wide single source of truth for WhatsApp/phone/
// email/social links, replacing the values previously hardcoded independently across
// WhatsAppButton, Footer, ContactClient, HeroSection, and the service-page CTAs.
public class ContactSettings
{
    public int Id { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ICollection<ContactPhoneNumber> PhoneNumbers { get; set; } = [];
    public ICollection<SocialLink> SocialLinks { get; set; } = [];
}
