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

            if (user.HouseholdId is not null)
                return BadRequest("User already belongs to a household.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Household name is required.");

            var household = new Household { Id = Guid.NewGuid(), Name = dto.Name };
            _context.Households.Add(household);
            await _context.SaveChangesAsync();

            // Link creator as Manager
            user.HouseholdId = household.Id;
            user.Role = HouseholdRole.Manager; // Set role to Manager

            _context.Users.Update(user); // optional, EF is already tracking `user`
            await _context.SaveChangesAsync();

            return Ok(household);
        }

        // Get household for logged-in user
        [HttpGet]
        public async Task<IActionResult> GetUserHousehold()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found.");

            var households = await _context.Households.FirstOrDefaultAsync(h => h.Id == user.HouseholdId);
            if (households is null)
                return NotFound("Household not found.");

            return Ok(households);
        }

        // Add member
        [HttpPost("{householdId}/members")]
        [Authorize("RequireManager")]
        public async Task<IActionResult> AddMember(Guid householdId, [FromBody] AddMemberDto dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null)
                return Unauthorized("User not found.");

            if (await _context.Users.AnyAsync(uh => uh.Id == dto.UserId && uh.HouseholdId == householdId))
                return BadRequest("User already in household.");

            var newUser = await _userManager.FindByIdAsync(dto.UserId);
            var household = await _context.Households.FindAsync(householdId);

            if (newUser is null || household is null)
                return NotFound("User or Household not found.");

            newUser.HouseholdId = householdId;
            newUser.Role = dto.Role;
            _context.Users.Update(newUser); // optional, EF is already tracking `newUser`
            await _context.SaveChangesAsync();

            return Ok("User added to household.");
        }

        // Remove member
        [HttpDelete("{householdId}/members/{userId}")]
        [Authorize("RequireManager")]
        public async Task<IActionResult> RemoveMember(Guid householdId, string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null)
                return Unauthorized("User not found.");

            var member = await _context.Users.FirstOrDefaultAsync(uh => uh.Id == userId && uh.HouseholdId == householdId);
            if (member is null)
                return NotFound();

            member.HouseholdId = null;
            member.Role = HouseholdRole.Reader;

            _context.Users.Update(member); // optional, EF is already tracking `member`
            await _context.SaveChangesAsync();

            return Ok("Member removed.");
        }
    }

}