using Backend.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Backend.API.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<AppUser>(options)
    {
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserHousehold> UserHouseholds { get; set; }
        public DbSet<Household> Households { get; set; }
        public DbSet<ShoppingList> ShoppingLists { get; set; }
        public DbSet<ShoppingItem> ShoppingItems { get; set; }
        public DbSet<StoreTag> StoreTags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserHousehold>().HasKey(uh => new { uh.UserId, uh.HouseholdId });
        }
    }
}