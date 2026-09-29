using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BugMuseum.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToBugExhibit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "BugExhibits",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "BugExhibits");
        }
    }
}
