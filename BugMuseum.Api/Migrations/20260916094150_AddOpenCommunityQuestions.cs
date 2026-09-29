using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BugMuseum.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOpenCommunityQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AcceptedCommentId",
                table: "BugExhibits",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiDiagnosticHint",
                table: "BugExhibits",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOpenQuestion",
                table: "BugExhibits",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsResolved",
                table: "BugExhibits",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptedCommentId",
                table: "BugExhibits");

            migrationBuilder.DropColumn(
                name: "AiDiagnosticHint",
                table: "BugExhibits");

            migrationBuilder.DropColumn(
                name: "IsOpenQuestion",
                table: "BugExhibits");

            migrationBuilder.DropColumn(
                name: "IsResolved",
                table: "BugExhibits");
        }
    }
}
