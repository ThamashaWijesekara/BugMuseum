//Output DTO

namespace BugMuseum.Api.DTOs
{
    public class BugExhibitDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ProgrammingLanguage { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string ExpectedBehavior { get; set; } = string.Empty;
        public string ActualBehavior { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public string Solution { get; set; } = string.Empty;
        public string LessonLearned { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;

        // Upvote metrics
        public int UpvoteCount { get; set; }
        public bool HasUpvoted { get; set; }
        public int CommentCount { get; set; }
        public string? ImageUrl { get; set; }

        public bool IsOpenQuestion { get; set; }
        public bool IsResolved { get; set; }
        public int? AcceptedCommentId { get; set; }
        public string? AiDiagnosticHint { get; set; }
        public class AiSummaryResponseDto
        {
            public string Summary { get; set; } = string.Empty;
        }

    }
}