using System.Drawing;

namespace Backend.API.Models
{
    public class StoreTag
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string ColorHex { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Guid HouseholdId { get; set; }
        public required Household Household { get; set; }
    }
}