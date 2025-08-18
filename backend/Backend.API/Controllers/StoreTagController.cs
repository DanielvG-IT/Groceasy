using Microsoft.AspNetCore.Mvc;
using Backend.API.Data;
using Backend.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

// TODO: Move logic to a service
// TODO: Implement validation
// TODO: Add error handling
// TODO: Implement logging
// TODO: Implement unit tests

namespace Backend.API.Controllers
{
    [Route("api/v1/household/{householdId}/StoreTags")]
    [ApiController]
    [Authorize]
    public class StoreTagController(ApplicationDbContext context, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<AppUser> _userManager = userManager;

        [HttpGet]
        public async Task<IActionResult> GetStoreTags(Guid householdId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found or not part of the household.");

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var storeTags = await _context.StoreTags
                .Where(st => st.HouseholdId == householdId)
                .ToListAsync();

            return Ok(storeTags);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStoreTag(Guid householdId, [FromBody] StoreTag storeTag)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found or not part of the household.");

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            storeTag.HouseholdId = householdId;
            _context.StoreTags.Add(storeTag);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStoreTags), new { householdId }, storeTag);
        }

        [HttpPut("{storeTagId}")]
        public async Task<IActionResult> UpdateStoreTag(Guid householdId, Guid storeTagId, [FromBody] StoreTag storeTag)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found or not part of the household.");

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            if (storeTagId != storeTag.Id)
                return BadRequest("StoreTag ID mismatch.");

            var existingTag = await _context.StoreTags.FindAsync(storeTagId);
            if (existingTag is null || existingTag.HouseholdId != householdId)
                return NotFound();

            existingTag.Name = storeTag.Name;
            existingTag.Description = storeTag.Description;
            existingTag.ColorHex = storeTag.ColorHex;
            existingTag.UpdatedAt = DateTime.UtcNow;

            _context.StoreTags.Update(existingTag);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{storeTagId}")]
        public async Task<IActionResult> DeleteStoreTag(Guid householdId, Guid storeTagId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found or not part of the household.");

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var existingTag = await _context.StoreTags.FindAsync(storeTagId);
            if (existingTag is null || existingTag.HouseholdId != householdId)
                return NotFound();

            _context.StoreTags.Remove(existingTag);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}