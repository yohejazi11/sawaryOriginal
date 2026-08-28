using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SawaryAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddImageDimensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoverImageHeight",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CoverImageWidth",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Height",
                table: "ProjectImages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Width",
                table: "ProjectImages",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImageHeight",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "CoverImageWidth",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "ProjectImages");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "ProjectImages");
        }
    }
}
