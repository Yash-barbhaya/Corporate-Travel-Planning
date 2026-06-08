using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETMs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_TravelRequests_Users_FinanceApprovedById",
            //     table: "TravelRequests");

            migrationBuilder.AddColumn<int>(
                name: "AdminApprovedById",
                table: "TravelRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManagerApprovedById",
                table: "TravelRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DepartmentBudgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BudgetLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentBudgets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_AdminApprovedById",
                table: "TravelRequests",
                column: "AdminApprovedById");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequests_ManagerApprovedById",
                table: "TravelRequests",
                column: "ManagerApprovedById");

            migrationBuilder.AddForeignKey(
                name: "FK_TravelRequests_Users_AdminApprovedById",
                table: "TravelRequests",
                column: "AdminApprovedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TravelRequests_Users_FinanceApprovedById",
                table: "TravelRequests",
                column: "FinanceApprovedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TravelRequests_Users_ManagerApprovedById",
                table: "TravelRequests",
                column: "ManagerApprovedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TravelRequests_Users_AdminApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_TravelRequests_Users_FinanceApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_TravelRequests_Users_ManagerApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropTable(
                name: "DepartmentBudgets");

            migrationBuilder.DropIndex(
                name: "IX_TravelRequests_AdminApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropIndex(
                name: "IX_TravelRequests_ManagerApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "AdminApprovedById",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "ManagerApprovedById",
                table: "TravelRequests");

            migrationBuilder.AddForeignKey(
                name: "FK_TravelRequests_Users_FinanceApprovedById",
                table: "TravelRequests",
                column: "FinanceApprovedById",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
