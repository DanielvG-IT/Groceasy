using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public class StoreTag
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)] // Example constraint for Name length
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MaxLength(7)] // Example constraint for ColorHex (e.g., #FFFFFF)
        public string ColorHex { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey(nameof(Household))]
        public Guid HouseholdId { get; set; }

        [Required]
        public Household? Household { get; set; } = new();
    }
}