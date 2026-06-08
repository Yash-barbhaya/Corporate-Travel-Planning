using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ETMs.Data.Migrations
{
    /// <inheritdoc />
    public partial class ForceAddReimbursementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AddColumn<int>(
            //    name: "FinanceApprovedById",
            //    table: "TravelRequests",
            //    type: "int",
            //    nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ApprovedAmount",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ManagerNotes",
                table: "Expenses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReimbursementStatus",
                table: "Expenses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            //migrationBuilder.CreateIndex(
            //    name: "IX_TravelRequests_FinanceApprovedById",
            //    table: "TravelRequests",
            //    column: "FinanceApprovedById");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_TravelRequests_Users_FinanceApprovedById",
            //    table: "TravelRequests",
            //    column: "FinanceApprovedById",
            //    principalTable: "Users",
            //    principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_TravelRequests_Users_FinanceApprovedById",
            //    table: "TravelRequests");

            //migrationBuilder.DropIndex(
            //    name: "IX_TravelRequests_FinanceApprovedById",
            //    table: "TravelRequests");

            //migrationBuilder.DropColumn(
            //    name: "FinanceApprovedById",
            //    table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "ApprovedAmount",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "ManagerNotes",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "ReimbursementStatus",
                table: "Expenses");
        }
    }
}
