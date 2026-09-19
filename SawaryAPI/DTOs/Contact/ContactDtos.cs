using System.ComponentModel.DataAnnotations;

namespace SawaryAPI.DTOs.Contact;

public class ContactPhoneNumberDto
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string? LabelAr { get; set; }
    public string? LabelEn { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateContactPhoneNumberDto
{
    [Required] public string Number { get; set; } = string.Empty;
    public string? LabelAr { get; set; }
    public string? LabelEn { get; set; }
}

public class UpdateContactPhoneNumberDto
{
    public string? Number { get; set; }
    public string? LabelAr { get; set; }
    public string? LabelEn { get; set; }
}

public class SocialLinkDto
{
    public int Id { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class CreateSocialLinkDto
{
    [Required] public string Platform { get; set; } = string.Empty;
    [Required] public string Url { get; set; } = string.Empty;
}

public class UpdateSocialLinkDto
{
    public string? Platform { get; set; }
    public string? Url { get; set; }
}

public class ContactSettingsDto
{
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<ContactPhoneNumberDto> PhoneNumbers { get; set; } = [];
    public List<SocialLinkDto> SocialLinks { get; set; } = [];
}

public class UpdateContactSettingsDto
{
    public string? WhatsAppNumber { get; set; }
    public string? Email { get; set; }
}
