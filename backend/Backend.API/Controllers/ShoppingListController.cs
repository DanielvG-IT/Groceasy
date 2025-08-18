using Backend.API.Data;
using Backend.API.Models;
using Microsoft.AspNetCore.Mvc;
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
    [Route("api/v1/household/{householdId}/ShoppingList")]
    [ApiController]
    [Authorize]
    public class ShoppingListController(ApplicationDbContext context, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<AppUser> _userManager = userManager;

        // ✅ GET all shopping lists in a household
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingList>>> GetShoppingLists(Guid householdId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check membership
            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var lists = await _context.ShoppingLists
                .Where(l => l.HouseholdId == householdId)
                .ToListAsync();

            return Ok(lists);
        }

        // ✅ GET a single shopping list
        [HttpGet("{shoppingListId}")]
        public async Task<ActionResult<ShoppingList>> GetShoppingList(Guid householdId, Guid shoppingListId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shoppingList = await _context.ShoppingLists
                .Include(l => l.Items)
                .FirstOrDefaultAsync(l => l.Id == shoppingListId && l.HouseholdId == householdId &&
                                     l.Household != null && l.Household.Members.Any(m => m.UserId == userId));

            if (shoppingList == null)
                return NotFound();

            return Ok(shoppingList);
        }

        // ✅ CREATE a shopping list
        [HttpPost]
        public async Task<ActionResult<ShoppingList>> CreateShoppingList(Guid householdId, [FromBody] ShoppingList shoppingList)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            shoppingList.HouseholdId = householdId;
            _context.ShoppingLists.Add(shoppingList);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShoppingList),
                new { householdId, id = shoppingList.Id },
                shoppingList);
        }

        // ✅ UPDATE a shopping list
        [HttpPut("{shoppingListId}")]
        public async Task<IActionResult> UpdateShoppingList(Guid householdId, Guid shoppingListId, [FromBody] ShoppingList shoppingList)
        {
            if (shoppingListId != shoppingList.Id)
                return BadRequest("Mismatched ID.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userRole = await _context.UserHouseholds
                .Where(uh => uh.UserId == userId && uh.HouseholdId == householdId)
                .Select(uh => uh.Role)
                .FirstOrDefaultAsync();

            if (userRole != HouseholdRole.Editor && userRole != HouseholdRole.Manager)
                return Forbid();

            var existingList = await _context.ShoppingLists
                .FirstOrDefaultAsync(l => l.Id == shoppingListId && l.HouseholdId == householdId);

            if (existingList == null)
                return NotFound();

            existingList.Name = shoppingList.Name;

            _context.ShoppingLists.Update(existingList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE a shopping list
        [HttpDelete("{shoppingListId}")]
        public async Task<IActionResult> DeleteShoppingList(Guid householdId, Guid shoppingListId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userRole = await _context.UserHouseholds
                .Where(uh => uh.UserId == userId && uh.HouseholdId == householdId)
                .Select(uh => uh.Role)
                .FirstOrDefaultAsync();

            if (userRole != HouseholdRole.Manager)
                return Forbid();

            var shoppingList = await _context.ShoppingLists
                .FirstOrDefaultAsync(l => l.Id == shoppingListId && l.HouseholdId == householdId);

            if (shoppingList == null)
                return NotFound();

            _context.ShoppingLists.Remove(shoppingList);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
