namespace Backend.API.Models
{
    public class UserHousehold
    {
        public required string UserId { get; set; }
        public required AppUser User { get; set; }

        public Guid HouseholdId { get; set; }
        public required Household Household { get; set; }
        public HouseholdRole Role { get; set; }
    }

    public enum HouseholdRole
    {
        Reader,
        Shopper,
        Editor,
        Manager
    }
}