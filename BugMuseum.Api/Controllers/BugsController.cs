using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

using BugMuseum.Api.Data;
using BugMuseum.Api.DTOs;
using BugMuseum.Api.Services;
using BugMuseum.Api.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BugMuseum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BugsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public BugsController(
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("id")?.Value ??
            User.FindFirst("sub")?.Value;

        return int.TryParse(userIdClaim, out int userId)
            ? userId
            : 0;
    }


    // ============================================================
    // GET: api/bugs
    // ============================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BugExhibitDto>>> GetBugs()
    {
        int currentUserId = GetCurrentUserId();

        var bugs = await _context.BugExhibits
            .Include(b => b.User)
            .Include(b => b.Reactions)
            .Include(b => b.Comments)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BugExhibitDto
            {
                Id = b.Id,
                Title = b.Title,
                ProgrammingLanguage = b.ProgrammingLanguage,

                Category = string.IsNullOrEmpty(b.Category)
                    ? "Backend"
                    : b.Category,

                Difficulty = string.IsNullOrEmpty(b.Difficulty)
                    ? "Intermediate"
                    : b.Difficulty,

                ExpectedBehavior = b.ExpectedBehavior,
                ActualBehavior = b.ActualBehavior,
                RootCause = b.RootCause,
                Solution = b.Solution,
                LessonLearned = b.LessonLearned,

                // IMPORTANT
                IsOpenQuestion = b.IsOpenQuestion,
                IsResolved = b.IsResolved,

                ImageUrl = b.ImageUrl,
                AiDiagnosticHint = b.AiDiagnosticHint,
                AcceptedCommentId = b.AcceptedCommentId,

                CreatedAt = b.CreatedAt,
                UserId = b.UserId,

                AuthorUsername = b.User != null
                    ? b.User.Username
                    : "Anonymous",

                UpvoteCount = b.Reactions.Count(),

                HasUpvoted =
                    currentUserId > 0 &&
                    b.Reactions.Any(r => r.UserId == currentUserId),

                CommentCount = b.Comments.Count()
            })
            .ToListAsync();

        return Ok(bugs);
    }


    // ============================================================
    // GET: api/bugs/5
    // ============================================================

    [HttpGet("{id}")]
    public async Task<ActionResult<BugExhibitDto>> GetBugById(int id)
    {
        var bug = await _context.BugExhibits
            .Include(b => b.User)
            .Include(b => b.Reactions)
            .Include(b => b.Comments)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bug == null)
        {
            return NotFound(new
            {
                message = $"Bug exhibit with ID {id} was not found."
            });
        }

        int currentUserId = GetCurrentUserId();

        var bugDto = new BugExhibitDto
        {
            Id = bug.Id,
            Title = bug.Title,
            ProgrammingLanguage = bug.ProgrammingLanguage,

            Category = string.IsNullOrEmpty(bug.Category)
                ? "Backend"
                : bug.Category,

            Difficulty = string.IsNullOrEmpty(bug.Difficulty)
                ? "Intermediate"
                : bug.Difficulty,

            ExpectedBehavior = bug.ExpectedBehavior,
            ActualBehavior = bug.ActualBehavior,
            RootCause = bug.RootCause,
            Solution = bug.Solution,
            LessonLearned = bug.LessonLearned,

            // IMPORTANT
            IsOpenQuestion = bug.IsOpenQuestion,
            IsResolved = bug.IsResolved,

            ImageUrl = bug.ImageUrl,
            AiDiagnosticHint = bug.AiDiagnosticHint,
            AcceptedCommentId = bug.AcceptedCommentId,

            CreatedAt = bug.CreatedAt,
            UserId = bug.UserId,

            AuthorUsername = bug.User != null
                ? bug.User.Username
                : "Anonymous",

            UpvoteCount = bug.Reactions.Count,

            HasUpvoted =
                currentUserId > 0 &&
                bug.Reactions.Any(r => r.UserId == currentUserId),

            CommentCount = bug.Comments.Count
        };

        return Ok(bugDto);
    }


    // ============================================================
    // GET: api/bugs/my-exhibits
    // ============================================================

    [HttpGet("my-exhibits")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BugExhibitDto>>> GetMyExhibits()
    {
        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bugs = await _context.BugExhibits
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BugExhibitDto
            {
                Id = b.Id,
                Title = b.Title,
                ProgrammingLanguage = b.ProgrammingLanguage,

                Category = string.IsNullOrEmpty(b.Category)
                    ? "Backend"
                    : b.Category,

                Difficulty = string.IsNullOrEmpty(b.Difficulty)
                    ? "Intermediate"
                    : b.Difficulty,

                ExpectedBehavior = b.ExpectedBehavior,
                ActualBehavior = b.ActualBehavior,
                RootCause = b.RootCause,
                Solution = b.Solution,
                LessonLearned = b.LessonLearned,

                // IMPORTANT
                IsOpenQuestion = b.IsOpenQuestion,
                IsResolved = b.IsResolved,

                ImageUrl = b.ImageUrl,
                AiDiagnosticHint = b.AiDiagnosticHint,
                AcceptedCommentId = b.AcceptedCommentId,

                CreatedAt = b.CreatedAt,
                UserId = b.UserId,

                AuthorUsername = b.User != null
                    ? b.User.Username
                    : "Anonymous",

                UpvoteCount = _context.ExhibitReactions
                    .Count(r => r.BugExhibitId == b.Id),

                HasUpvoted = _context.ExhibitReactions
                    .Any(r =>
                        r.BugExhibitId == b.Id &&
                        r.UserId == userId),

                CommentCount = _context.ExhibitComments
                    .Count(c => c.BugExhibitId == b.Id)
            })
            .ToListAsync();

        return Ok(bugs);
    }


    // ============================================================
    // POST: api/bugs
    // ============================================================

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BugExhibitDto>> CreateBug(
        [FromBody] CreateBugExhibitDto dto,
        [FromServices] IAiService aiService)
    {
        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bug = new BugExhibit
        {
            Title = dto.Title,
            ProgrammingLanguage = dto.ProgrammingLanguage,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "Backend" : dto.Category,
            Difficulty = string.IsNullOrWhiteSpace(dto.Difficulty) ? "Intermediate" : dto.Difficulty,
            ExpectedBehavior = dto.ExpectedBehavior,
            ActualBehavior = dto.ActualBehavior,
            RootCause = dto.RootCause,
            Solution = dto.Solution,
            LessonLearned = dto.LessonLearned,

            // 🚨 EXPLICIT BINDING
            IsOpenQuestion = dto.IsOpenQuestion,
            IsResolved = !dto.IsOpenQuestion, // If Open Question -> IsResolved = false. If Post-Mortem -> IsResolved = true.

            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };


        // ========================================================
        // AI DIAGNOSTIC HINT FOR OPEN QUESTIONS
        // ========================================================

        if (bug.IsOpenQuestion)
        {
            try
            {
                string aiPrompt =
                    $"You are an expert developer. Provide a clear, actionable solution and code snippet to solve this unresolved bug in {bug.ProgrammingLanguage}:\n\n" +
                    $"Title: {bug.Title}\n" +
                    $"Expected Behavior: {bug.ExpectedBehavior}\n" +
                    $"Actual Behavior / Error: {bug.ActualBehavior}\n\n" +
                    $"Format your response with a 1-sentence explanation followed by the corrected code solution.";
                bug.AiDiagnosticHint =
                    await aiService.GenerateSummaryAsync(aiPrompt);
            }
            catch
            {
                bug.AiDiagnosticHint =
                    "AI diagnostic response temporarily unavailable. Community suggestions are welcome below!";
            }
        }


        _context.BugExhibits.Add(bug);

        await _context.SaveChangesAsync();


        var user = await _context.Users.FindAsync(userId);


        var responseDto = new BugExhibitDto
        {
            Id = bug.Id,
            Title = bug.Title,
            ProgrammingLanguage = bug.ProgrammingLanguage,
            Category = bug.Category,
            Difficulty = bug.Difficulty,

            ExpectedBehavior = bug.ExpectedBehavior,
            ActualBehavior = bug.ActualBehavior,
            RootCause = bug.RootCause,
            Solution = bug.Solution,
            LessonLearned = bug.LessonLearned,

            IsOpenQuestion = bug.IsOpenQuestion,
            IsResolved = bug.IsResolved,

            ImageUrl = bug.ImageUrl,
            AiDiagnosticHint = bug.AiDiagnosticHint,
            AcceptedCommentId = bug.AcceptedCommentId,

            CreatedAt = bug.CreatedAt,
            UserId = bug.UserId,

            AuthorUsername = user != null
                ? user.Username
                : "Anonymous",

            UpvoteCount = 0,
            HasUpvoted = false,
            CommentCount = 0
        };

        return CreatedAtAction(
            nameof(GetBugById),
            new { id = bug.Id },
            responseDto);
    }


    // ============================================================
    // PUT: api/bugs/5
    // ============================================================

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateBug(
        int id,
        UpdateBugExhibitDto dto)
    {
        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bug = await _context.BugExhibits
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bug == null)
        {
            return NotFound(new
            {
                message = $"Bug exhibit with ID {id} was not found."
            });
        }

        if (bug.UserId != userId)
        {
            return Forbid();
        }

        bug.Title = dto.Title;
        bug.ProgrammingLanguage = dto.ProgrammingLanguage;
        bug.Category = dto.Category;
        bug.Difficulty = dto.Difficulty;
        bug.ExpectedBehavior = dto.ExpectedBehavior;
        bug.ActualBehavior = dto.ActualBehavior;
        bug.RootCause = dto.RootCause;
        bug.Solution = dto.Solution;
        bug.LessonLearned = dto.LessonLearned;

        await _context.SaveChangesAsync();

        return NoContent();
    }


    // ============================================================
    // DELETE: api/bugs/5
    // ============================================================

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteBug(int id)
    {
        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bug = await _context.BugExhibits
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bug == null)
        {
            return NotFound(new
            {
                message = $"Bug exhibit with ID {id} was not found."
            });
        }

        if (bug.UserId != userId)
        {
            return Forbid();
        }

        _context.BugExhibits.Remove(bug);

        await _context.SaveChangesAsync();

        return NoContent();
    }


    // ============================================================
    // POST: api/bugs/5/upvote
    // ============================================================

    [HttpPost("{bugId}/upvote")]
    [Authorize]
    public async Task<IActionResult> ToggleUpvote(int bugId)
    {
        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bugExists = await _context.BugExhibits
            .AnyAsync(b => b.Id == bugId);

        if (!bugExists)
        {
            return NotFound(new
            {
                message = $"Bug exhibit with ID {bugId} was not found."
            });
        }

        var existingUpvote = await _context.ExhibitReactions
            .FirstOrDefaultAsync(r =>
                r.BugExhibitId == bugId &&
                r.UserId == userId);

        bool hasUpvoted;

        if (existingUpvote != null)
        {
            _context.ExhibitReactions.Remove(existingUpvote);
            hasUpvoted = false;
        }
        else
        {
            var newReaction = new ExhibitReaction
            {
                BugExhibitId = bugId,
                UserId = userId,
                ReactedAt = DateTime.UtcNow
            };

            await _context.ExhibitReactions.AddAsync(newReaction);

            hasUpvoted = true;
        }

        await _context.SaveChangesAsync();

        var upvoteCount = await _context.ExhibitReactions
            .CountAsync(r => r.BugExhibitId == bugId);

        return Ok(new
        {
            upvoteCount,
            hasUpvoted
        });
    }


    // ============================================================
    // GET: api/bugs/5/comments
    // ============================================================

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<ExhibitCommentDto>>> GetComments(int id)
    {
        var comments = await _context.ExhibitComments
            .Where(c => c.BugExhibitId == id)
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ExhibitCommentDto
            {
                Id = c.Id,
                Text = c.Text,
                CreatedAt = c.CreatedAt,

                AuthorUsername = c.User != null
                    ? c.User.Username
                    : "Anonymous"
            })
            .ToListAsync();

        return Ok(comments);
    }


    // ============================================================
    // POST: api/bugs/5/comments
    // ============================================================

    [HttpPost("{id}/comments")]
    [Authorize]
    public async Task<ActionResult<ExhibitCommentDto>> AddComment(
        int id,
        CreateCommentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Text))
        {
            return BadRequest("Comment text cannot be empty.");
        }

        int userId = GetCurrentUserId();

        if (userId == 0)
            return Unauthorized();

        var bugExists = await _context.BugExhibits
            .AnyAsync(b => b.Id == id);

        if (!bugExists)
        {
            return NotFound();
        }

        var comment = new ExhibitComment
        {
            BugExhibitId = id,
            UserId = userId,
            Text = dto.Text.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.ExhibitComments.Add(comment);

        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return Ok(new ExhibitCommentDto
        {
            Id = comment.Id,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,

            AuthorUsername = user != null
                ? user.Username
                : "Anonymous"
        });
    }


    // ============================================================
    // POST: api/bugs/5/summarize
    // ============================================================

    [HttpPost("{id}/summarize")]
    [Authorize]
    public async Task<ActionResult<AiSummaryResponseDto>> SummarizeBug(int id)
    {
        var bug = await _context.BugExhibits
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bug == null)
        {
            return NotFound(new
            {
                message = $"Bug exhibit with ID {id} was not found."
            });
        }

        var apiKey =
            _configuration["GeminiSettings:ApiKey"];

        var model =
            _configuration["GeminiSettings:Model"]
            ?? "gemini-2.5-flash";

        if (string.IsNullOrEmpty(apiKey) ||
            apiKey == "YOUR_GEMINI_API_KEY_HERE")
        {
            return BadRequest(new
            {
                message = "Gemini API key is not configured."
            });
        }

        var promptText = $@"
You are an expert software engineer reviewing a bug report.

Summarize the following bug exhibit into 2 concise,
bullet-pointed executive sentences:

1. What broke (Expected vs Actual)
2. Core fix applied & key lesson learned.

Title: {bug.Title}

Language/Tech: {bug.ProgrammingLanguage}

Expected: {bug.ExpectedBehavior}

Actual: {bug.ActualBehavior}

Root Cause: {bug.RootCause}

Solution: {bug.Solution}

Lesson Learned: {bug.LessonLearned}
";

        var requestPayload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = promptText
                        }
                    }
                }
            }
        };

        var geminiEndpoint =
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        using var httpClient = new HttpClient();

        var content = new StringContent(
            JsonSerializer.Serialize(requestPayload),
            Encoding.UTF8,
            MediaTypeHeaderValue.Parse("application/json")
        );

        var response = await httpClient.PostAsync(
            geminiEndpoint,
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorResponse =
                await response.Content.ReadAsStringAsync();

            return StatusCode(
                (int)response.StatusCode,
                $"Gemini API Error: {errorResponse}");
        }

        var jsonResponse =
            await response.Content.ReadAsStringAsync();

        using var doc =
            JsonDocument.Parse(jsonResponse);

        var summaryText = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString()
            ?? "No summary available.";

        return Ok(new AiSummaryResponseDto
        {
            Summary = summaryText
        });
    }


    // ============================================================
    // POST: api/bugs/5/photo
    // ============================================================

    [HttpPost("{id}/photo")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto(
        int id,
        [FromForm] IFormFile file,
        [FromServices] IPhotoService photoService)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file was uploaded.");
        }

        var bug = await _context.BugExhibits
            .FindAsync(id);

        if (bug == null)
            return NotFound("Exhibit not found.");

        int userId = GetCurrentUserId();

        if (bug.UserId != userId)
            return Forbid();

        var result =
            await photoService.AddPhotoAsync(file);

        if (result.Error != null)
        {
            return BadRequest(result.Error.Message);
        }

        bug.ImageUrl =
            result.SecureUrl.AbsoluteUri;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            imageUrl = bug.ImageUrl
        });
    }


    // ============================================================
    // POST: api/bugs/5/accept-solution/10
    // ============================================================

    [HttpPost("{bugId}/accept-solution/{commentId}")]
    [Authorize]
    public async Task<IActionResult> AcceptSolution(
        int bugId,
        int commentId)
    {
        var bug = await _context.BugExhibits
            .FindAsync(bugId);

        if (bug == null)
            return NotFound("Exhibit not found.");

        int userId = GetCurrentUserId();

        if (bug.UserId != userId)
            return Forbid();

        var comment = await _context.ExhibitComments
            .FindAsync(commentId);

        if (comment == null ||
            comment.BugExhibitId != bugId)
        {
            return BadRequest(
                "Comment does not exist for this exhibit.");
        }

        // Open question remains an open-question type,
        // but it is now resolved.
        bug.IsResolved = true;

        bug.AcceptedCommentId = commentId;

        bug.Solution = comment.Text;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Solution accepted!",
            isResolved = true
        });
    }
}