using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PostgreSqlMigration.Migrations
{
    /// <inheritdoc />
    public partial class add_reviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "reviews",
                schema: "popcorn_index",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_type = table.Column<string>(type: "text", nullable: false),
                    tmdb_id = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<short>(type: "smallint", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reviews", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "season_reviews",
                schema: "popcorn_index",
                columns: table => new
                {
                    review_id = table.Column<Guid>(type: "uuid", nullable: false),
                    season_number = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<short>(type: "smallint", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_season_reviews", x => new { x.review_id, x.season_number });
                    table.ForeignKey(
                        name: "fk_season_reviews_reviews_review_id",
                        column: x => x.review_id,
                        principalSchema: "popcorn_index",
                        principalTable: "reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_reviews_media_type_tmdb_id",
                schema: "popcorn_index",
                table: "reviews",
                columns: new[] { "media_type", "tmdb_id" });

            migrationBuilder.CreateIndex(
                name: "ix_reviews_user_id",
                schema: "popcorn_index",
                table: "reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_user_id_media_type_tmdb_id",
                schema: "popcorn_index",
                table: "reviews",
                columns: new[] { "user_id", "media_type", "tmdb_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "season_reviews",
                schema: "popcorn_index");

            migrationBuilder.DropTable(
                name: "reviews",
                schema: "popcorn_index");
        }
    }
}
