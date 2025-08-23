using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("Households")]
    public class Household
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        // Navigation property for ShoppingLists
        public virtual ICollection<ShoppingList> ShoppingLists { get; set; } = new HashSet<ShoppingList>();
    }
}