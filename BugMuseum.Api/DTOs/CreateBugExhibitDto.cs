//when user creating a new bug this DTO data must send
//Input DTO
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BugMuseum.Api.Models;

namespace BugMuseum.Api.DTOs;

public class CreateBugExhibitDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Programming language is required.")]
    public string ProgrammingLanguage { get; set; } = string.Empty;
    public string Category { get; set; } = "Backend";
    public string Difficulty { get; set; } = "Intermediate";

    [Required]
    public string ExpectedBehavior { get; set; } = string.Empty;

    [Required]
    public string ActualBehavior { get; set; } = string.Empty;

    public string RootCause { get; set; } = string.Empty;
    public string Solution { get; set; } = string.Empty;

    public string LessonLearned { get; set; } = string.Empty;
    public int UserId { get; set; }

    public bool IsOpenQuestion { get; set; } = false;
}