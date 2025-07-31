namespace Backend.API.Models
{
    public class ShoppingList
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public Guid HouseholdId { get; set; }
        public required Household Household { get; set; }

        public required ICollection<ShoppingItem> Items { get; set; }
    }
}