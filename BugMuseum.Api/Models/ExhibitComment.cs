using System.ComponentModel.DataAnnotations;

namespace BugMuseum.Api.Models;

public class ExhibitComment
{
    public int Id { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Keys & Navigation Properties
    public int BugExhibitId { get; set; }
    public BugExhibit? BugExhibit { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}