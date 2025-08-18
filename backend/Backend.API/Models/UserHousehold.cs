using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public class UserHousehold
    {
        public required string UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public AppUser? User { get; set; }

        public Guid HouseholdId { get; set; }

        [ForeignKey(nameof(HouseholdId))]
        public Household? Household { get; set; }

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