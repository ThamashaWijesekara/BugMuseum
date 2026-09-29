using System.ComponentModel.DataAnnotations;

namespace BugMuseum.Api.DTOs;

public class UpdateBugExhibitDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string ProgrammingLanguage { get; set; } = string.Empty;
    [Required]
    public string Category { get; set; } = "Backend";
    [Required]
    public string Difficulty { get; set; } = "Intermediate";

    [Required]
    public string ExpectedBehavior { get; set; } = string.Empty;

    [Required]
    public string ActualBehavior { get; set; } = string.Empty;

    [Required]
    public string RootCause { get; set; } = string.Empty;

    [Required]
    public string Solution { get; set; } = string.Empty;

    [Required]
    public string LessonLearned { get; set; } = string.Empty;
}