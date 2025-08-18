using Backend.API.Data;
using Backend.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.API.Controllers
{
    [Route("api/v1/household/{householdId}/ShoppingList/{shoppingListId}/Items")]
    [ApiController]
    [Authorize]
    public class ShoppingListItemController(ApplicationDbContext context, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<AppUser> _userManager = userManager;

        // ✅ GET all items in a shopping list
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingItem>>> GetItems(Guid householdId, Guid shoppingListId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var items = await _context.ShoppingItems
                .Where(i => i.ShoppingListId == shoppingListId)
                .ToListAsync();

            return Ok(items);
        }

        // ✅ GET a single item in a shopping list
        [HttpGet("{shoppingItemId}")]
        public async Task<ActionResult<ShoppingItem>> GetItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var item = await _context.ShoppingItems
                .FirstOrDefaultAsync(i => i.Id == shoppingItemId && i.ShoppingListId == shoppingListId);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ✅ POST a new item to a shopping list
        [HttpPost]
        public async Task<ActionResult<ShoppingItem>> CreateItem(Guid householdId, Guid shoppingListId, [FromBody] ShoppingItem item)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("User not found.");

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var userHousehold = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);

            if (userHousehold is null || userHousehold.Role == HouseholdRole.Reader || userHousehold.Role == HouseholdRole.Shopper)
                return Forbid();

            item.ShoppingListId = shoppingListId;
            _context.ShoppingItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { householdId, shoppingListId, id = item.Id }, item);
        }

        // ✅ PUT (update) an item in a shopping list
        [HttpPut("{shoppingItemId}")]
        public async Task<ActionResult<ShoppingItem>> UpdateItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId, [FromBody] ShoppingItem item)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var userHousehold = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);

            if (userHousehold is null || userHousehold.Role == HouseholdRole.Reader || userHousehold.Role == HouseholdRole.Shopper)
                return Forbid();

            if (shoppingItemId != item.Id)
                return BadRequest();

            var existingItem = await _context.ShoppingItems.FindAsync(shoppingItemId);
            if (existingItem is null)
                return NotFound();

            existingItem.Name = item.Name;
            existingItem.Quantity = item.Quantity;
            existingItem.Checked = item.Checked;
            existingItem.Notes = item.Notes;
            existingItem.StoreTagId = item.StoreTagId;
            existingItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existingItem);
        }

        // ✅ DELETE an item from a shopping list
        [HttpDelete("{shoppingItemId}")]
        public async Task<IActionResult> DeleteItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await _context.UserHouseholds.AnyAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);
            if (!isMember)
                return Forbid();

            var userHousehold = await _context.UserHouseholds
                .FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HouseholdId == householdId);

            if (userHousehold is null || userHousehold.Role == HouseholdRole.Reader || userHousehold.Role == HouseholdRole.Shopper)
                return Forbid();

            var item = await _context.ShoppingItems.FindAsync(shoppingItemId);
            if (item is null)
                return NotFound();

            _context.ShoppingItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
