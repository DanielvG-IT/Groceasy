using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public class AppUser : IdentityUser
    {
        [Required]
        [MaxLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [MaxLength(50)]
        public required string LastName { get; set; }

        public Guid? HouseholdId { get; set; }

        [ForeignKey(nameof(HouseholdId))]
        public Household? Household { get; set; }

        public HouseholdRole? Role { get; set; }
    }

    public enum HouseholdRole
    {
        Reader,
        Shopper,
        Editor,
        Manager
    }


    public class HouseholdRoleRequirement(HouseholdRole minimumRole) : IAuthorizationRequirement
    {
        public HouseholdRole MinimumRole { get; } = minimumRole;
    }

    public class CurrentUserDto
    {
        public string Id { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;

        // For now, single household
        public Guid? HouseholdId { get; set; }
        public string? HouseholdName { get; set; }
        public HouseholdRole? Role { get; set; }
    }

}