using Backend.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Microsoft.AspNetCore.Identity;
using Backend.API.Models.Dto;

// TODO: Move logic to a service
// TODO: Implement validation
// TODO: Add error handling
// TODO: Implement logging
// TODO: Implement unit tests

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/v1/household")]
    [Authorize] // Require authentication
    public class HouseholdController(ApplicationDbContext context, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<AppUser> _userManager = userManager;

        // Create Household
        [HttpPost]
        public async Task<IActionResult> CreateHousehold([FromBody] CreateHouseholdDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found.");

            var household = new Household { Name = dto.Name };
            _context.Households.Add(household);
            await _context.SaveChangesAsync();

            // Link creator as Manager
            _context.UserHouseholds.Add(new UserHousehold
            {
                UserId = user.Id,
                HouseholdId = household.Id,
                Role = HouseholdRole.Manager,
                User = user,
                Household = household
            });
            await _context.SaveChangesAsync();

            return Ok(household);
        }

        // Get households for logged-in user
        [HttpGet]
        public async Task<IActionResult> GetUserHouseholds()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found.");

            var households = await _context.UserHouseholds
                .Where(uh => uh.UserId == user.Id)
                .Include(uh => uh.Household)
                .Select(uh => new
                {
                    uh.HouseholdId,
                    HouseholdName = uh.Household != null ? uh.Household.Name : null,
                    Role = uh.Role.ToString()
                })
                .ToListAsync();

            return Ok(households);
        }

        // Add member
        [HttpPost("{householdId}/members")]
        public async Task<IActionResult> AddMember(Guid householdId, [FromBody] AddMemberDto dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null)
                return Unauthorized("User not found.");

            // Check role of current user in household
            var membership = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == currentUser.Id && uh.HouseholdId == householdId);

            if (membership is null || membership.Role == HouseholdRole.Reader || membership.Role == HouseholdRole.Shopper || membership.Role == HouseholdRole.Editor)
                return Forbid(); // Only Owner/Admin can invite

            if (await _context.UserHouseholds.AnyAsync(uh => uh.UserId == dto.UserId && uh.HouseholdId == householdId))
                return BadRequest("User already in household.");

            var user = await _userManager.FindByIdAsync(dto.UserId);
            var household = await _context.Households.FindAsync(householdId);

            if (user is null || household is null)
                return NotFound("User or Household not found.");

            _context.UserHouseholds.Add(new UserHousehold
            {
                UserId = user.Id,
                HouseholdId = householdId,
                Role = Enum.TryParse(dto.Role, out HouseholdRole parsedRole) ? parsedRole : HouseholdRole.Reader,
                User = user,
                Household = household
            });
            await _context.SaveChangesAsync();

            return Ok("User added to household.");
        }

        // Remove member
        [HttpDelete("{householdId}/members/{userId}")]
        public async Task<IActionResult> RemoveMember(Guid householdId, string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null)
                return Unauthorized("User not found.");

            var membership = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == currentUser.Id && uh.HouseholdId == householdId);

            if (membership is null || membership.Role == HouseholdRole.Reader || membership.Role == HouseholdRole.Shopper || membership.Role == HouseholdRole.Editor)
                return Forbid();

            var member = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);

            if (member is null) return NotFound();

            _context.UserHouseholds.Remove(member);
            await _context.SaveChangesAsync();

            return Ok("Member removed.");
        }
    }

}