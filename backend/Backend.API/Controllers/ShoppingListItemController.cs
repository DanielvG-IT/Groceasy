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
    [Route("api/v1/household/{householdId}/ShoppingList/{shoppingListId}/Items")]
    [ApiController]
    [Authorize]
    public class ShoppingListItemController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // ✅ GET all items in a shopping list
        [HttpGet]
        [Authorize("BeMember")]
        public async Task<ActionResult<IEnumerable<ShoppingItem>>> GetItems(Guid householdId, Guid shoppingListId)
        {
            var items = await _context.ShoppingItems
                .Where(i => i.ShoppingListId == shoppingListId)
                .ToListAsync();

            return Ok(items);
        }

        // ✅ GET a single item in a shopping list
        [HttpGet("{shoppingItemId}")]
        [Authorize("BeMember")]
        public async Task<ActionResult<ShoppingItem>> GetItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId)
        {
            var item = await _context.ShoppingItems.FirstOrDefaultAsync(i => i.Id == shoppingItemId && i.ShoppingListId == shoppingListId);
            if (item is null)
                return NotFound();

            return Ok(item);
        }

        // ✅ POST a new item to a shopping list
        [HttpPost]
        [Authorize("RequireEditor")]
        public async Task<ActionResult<ShoppingItem>> CreateItem(Guid householdId, Guid shoppingListId, [FromBody] ShoppingItem item)
        {
            item.ShoppingListId = shoppingListId;
            _context.ShoppingItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { householdId, shoppingListId, id = item.Id }, item);
        }

        // ✅ PUT (update) an item in a shopping list
        [HttpPut("{shoppingItemId}")]
        [Authorize("RequireEditor")]
        public async Task<ActionResult<ShoppingItem>> UpdateItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId, [FromBody] ShoppingItem item)
        {
            if (shoppingItemId != item.Id)
                return BadRequest("ShoppingItem ID mismatch.");

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
        [Authorize("RequireEditor")]
        public async Task<IActionResult> DeleteItem(Guid householdId, Guid shoppingListId, Guid shoppingItemId)
        {
            var item = await _context.ShoppingItems.FindAsync(shoppingItemId);
            if (item is null)
                return NotFound();

            _context.ShoppingItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // TODO: Add checkoff functionality
        // TODO: Implement bulk operations (e.g., mark all as checked, delete all checked)
        // TODO: Add pagination for GET endpoints
    }
}
