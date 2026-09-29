using System.ComponentModel.DataAnnotations;

namespace BugMuseum.Api.Models;

public class BugExhibit
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string ProgrammingLanguage { get; set; } = string.Empty;

    public string Category { get; set; } = "Backend";
    public string Difficulty { get; set; } = "Intermediate";

    [Required]
    public string ExpectedBehavior { get; set; } = string.Empty;

    [Required]
    public string ActualBehavior { get; set; } = string.Empty;

    
    public string RootCause { get; set; } = string.Empty;

    
    public string Solution { get; set; } = string.Empty;

    [Required]
    public string LessonLearned { get; set; } = string.Empty;

    public bool IsOpenQuestion { get; set; } = true;
    public bool IsResolved { get; set; } = false;
    public int? AcceptedCommentId { get; set; }
    public string? AiDiagnosticHint { get; set; } // Auto-generated AI response

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Key & Navigation Property for User
    public int UserId { get; set; }
    public User? User { get; set; }

    public string? ImageUrl { get; set; }

    // Navigation Collection for Upvotes/Reactions
    public ICollection<ExhibitReaction> Reactions { get; set; } = new List<ExhibitReaction>();

    // Inside Models/BugExhibit.cs
    public ICollection<ExhibitComment> Comments { get; set; } = new List<ExhibitComment>();
}