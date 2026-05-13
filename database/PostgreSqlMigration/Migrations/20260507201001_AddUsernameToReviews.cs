using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PostgreSqlMigration.Migrations
{
    /// <inheritdoc />
    public partial class AddUsernameToReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "username",
                schema: "popcorn_index",
                table: "reviews",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "username",
                schema: "popcorn_index",
                table: "reviews");
        }
    }
}
