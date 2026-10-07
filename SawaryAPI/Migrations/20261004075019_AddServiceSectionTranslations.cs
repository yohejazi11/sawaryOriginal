using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SawaryAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceSectionTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "ServiceSections");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "ServiceSections",
                newName: "TitleEn");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "ServiceCards",
                newName: "TitleEn");

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "ServiceSections",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "ServiceSections",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleAr",
                table: "ServiceSections",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "ServiceCards",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "ServiceCards",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleAr",
                table: "ServiceCards",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "ServiceSections");

            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "ServiceSections");

            migrationBuilder.DropColumn(
                name: "TitleAr",
                table: "ServiceSections");

            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "ServiceCards");

            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "ServiceCards");

            migrationBuilder.DropColumn(
                name: "TitleAr",
                table: "ServiceCards");

            migrationBuilder.RenameColumn(
                name: "TitleEn",
                table: "ServiceSections",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "TitleEn",
                table: "ServiceCards",
                newName: "Title");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ServiceSections",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
