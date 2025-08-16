using Backend.API.Data;
using Backend.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize] // Require authentication
    public class ShoppingListController(ApplicationDbContext context, UserManager<AppUser> userManager) : ControllerBase()
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<AppUser> _userManager = userManager;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingList>>> GetShoppingLists()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var householdId = await _context.UserHouseholds
                .Where(uh => uh.UserId == userId)
                .Select(uh => uh.HouseholdId)
                .FirstOrDefaultAsync();

            if (householdId == Guid.Empty)
                return NotFound("User does not belong to a household.");

            var lists = await _context.ShoppingLists
                .Where(l => l.HouseholdId == householdId)
                .ToListAsync();

            return Ok(lists);
        }

        // Get a single shopping list by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ShoppingList>> GetShoppingList(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shoppingList = await _context.ShoppingLists
                .Include(l => l.Items)
                .FirstOrDefaultAsync(l => l.Id == id && l.Household.Members.Any(u => u.UserId == userId));

            if (shoppingList == null)
                return NotFound();

            return Ok(shoppingList);
        }

        // Create a new shopping list
        [HttpPost]
        public async Task<ActionResult<ShoppingList>> CreateShoppingList([FromBody] ShoppingList shoppingList)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var householdId = await _context.UserHouseholds
                .Where(uh => uh.UserId == userId)
                .Select(uh => uh.HouseholdId)
                .FirstOrDefaultAsync();

            if (householdId == Guid.Empty)
                return BadRequest("User does not belong to a household.");

            shoppingList.HouseholdId = householdId;

            _context.ShoppingLists.Add(shoppingList);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShoppingList), new { id = shoppingList.Id }, shoppingList);
        }

        // Update a shopping list
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShoppingList(Guid id, [FromBody] ShoppingList shoppingList)
        {
            if (id != shoppingList.Id)
                return BadRequest("Mismatched ID.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return Unauthorized();

            var hasAccess = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId &&
                uh.Household.ShoppingLists.Any(sl => sl.Id == id) &&
                (uh.Role == HouseholdRole.Editor || uh.Role == HouseholdRole.Manager)
            );
            if (!hasAccess)
                return Forbid();

            var existingList = await _context.ShoppingLists.FirstOrDefaultAsync(l => l.Id == id && l.Household.Members.Any(u => u.UserId == userId));
            if (existingList == null)
                return NotFound();

            existingList.Name = shoppingList.Name;

            _context.ShoppingLists.Update(existingList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete a shopping list
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingList(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shoppingList = await _context.ShoppingLists
                .FirstOrDefaultAsync(l => l.Id == id && l.Household.Members.Any(u => u.UserId == userId));

            if (shoppingList == null)
                return NotFound();

            _context.ShoppingLists.Remove(shoppingList);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
