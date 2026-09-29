namespace BugMuseum.Api.Models;

public class ExhibitReaction
{
    public int Id { get; set; }
    public int BugExhibitId { get; set; }
    public BugExhibit? BugExhibit { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime ReactedAt { get; set; } = DateTime.UtcNow;
}