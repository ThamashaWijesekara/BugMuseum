namespace BugMuseum.Api.DTOs;

public class ExhibitCommentDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
}

public class CreateCommentDto
{
    public string Text { get; set; } = string.Empty;
}