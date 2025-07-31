namespace Backend.API.Models
{
    public class ShoppingItem
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public int Quantity { get; set; } = 1;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool Checked { get; set; }

        public Guid StoreTagId { get; set; }
        public StoreTag? StoreTag { get; set; }
    }
}