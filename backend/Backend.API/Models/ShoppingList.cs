using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public class ShoppingList
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)] // Example constraint for Name length
        public string Name { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        [ForeignKey(nameof(Household))]
        public Guid HouseholdId { get; set; }

        [Required]
        public Household Household { get; set; } = null!;

        [Required]
        public ICollection<ShoppingItem> Items { get; set; } = [];
    }
}