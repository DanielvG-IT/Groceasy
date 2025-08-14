using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public class ShoppingItem
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)] // Example constraint for the Name field
        public string Name { get; set; } = null!;

        [Range(1, int.MaxValue)] // Ensures Quantity is at least 1
        public int Quantity { get; set; } = 1;

        public string? Notes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool Checked { get; set; }

        [ForeignKey(nameof(StoreTag))]
        public Guid StoreTagId { get; set; }

        public StoreTag? StoreTag { get; set; }
    }
}