using ETMs.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Context
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<TravelRequest> TravelRequests { get; set; }
        public DbSet<Expense> Expenses { get; set; } // Add this property
        public DbSet<Itinerary> Itineraries { get; set; }
        public DbSet<DepartmentBudget> DepartmentBudgets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Manager_Id).HasColumnName("Manager_Id");
                entity.Property(e => e.Created_At).HasColumnName("Created_At");
                entity.Property(e => e.IsActive).HasColumnName("IsActive").HasDefaultValue(true);
            });

            // 2. TravelRequest Configuration
            modelBuilder.Entity<TravelRequest>(entity =>
            {
                entity.ToTable("TravelRequests");
                entity.HasKey(e => e.Id);

                // Fixes the truncation validation error: Stores numbers up to 18 digits total, 2 decimal places (e.g. 999999.99)
                entity.Property(tr => tr.EstimatedBudget)
                      .HasColumnType("decimal(18,2)");

                // Restrict deletion if dependencies exist
                entity.HasOne(tr => tr.User)
                      .WithMany()
                      .HasForeignKey(tr => tr.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(tr => tr.ManagerApprovedBy)
                      .WithMany()
                      .HasForeignKey(tr => tr.ManagerApprovedById)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(tr => tr.FinanceApprovedBy)
                      .WithMany()
                      .HasForeignKey(tr => tr.FinanceApprovedById)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(tr => tr.AdminApprovedBy)
                      .WithMany()
                      .HasForeignKey(tr => tr.AdminApprovedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // 3. Expense Configuration
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.ToTable("Expenses");
                entity.HasKey(e => e.Id);

                // Enforce decimal rules for currency fields
                entity.Property(e => e.Amount)
                      .HasColumnType("decimal(18,2)");

                // Define Relationship: A Travel Request has many Expenses; Deleting a request cleans up its bills.
                entity.HasOne(e => e.TravelRequest)
                      .WithMany(tr => tr.Expenses)
                      .HasForeignKey(e => e.TravelRequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 4. DepartmentBudget Configuration
            modelBuilder.Entity<DepartmentBudget>(entity =>
            {
                entity.ToTable("DepartmentBudgets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BudgetLimit)
                      .HasColumnType("decimal(18,2)");
            });
        }
    }
}
