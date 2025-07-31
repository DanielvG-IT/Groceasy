using System;
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
        public required string Name { get; set; }

        public required ICollection<UserHousehold> Members { get; set; }
        public required ICollection<ShoppingList> ShoppingLists { get; set; }
    }
}