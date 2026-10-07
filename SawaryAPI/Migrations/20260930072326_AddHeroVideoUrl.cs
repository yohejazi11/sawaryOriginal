using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SawaryAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroVideoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HeroVideoUrl",
                table: "ContactSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "ContactSettings",
                keyColumn: "Id",
                keyValue: 1,
                column: "HeroVideoUrl",
                value: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroVideoUrl",
                table: "ContactSettings");
        }
    }
}
