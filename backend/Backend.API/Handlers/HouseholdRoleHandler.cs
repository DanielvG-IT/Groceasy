

using Backend.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace Backend.API.Handlers
{
    public class HouseholdRoleHandler(UserManager<AppUser> userManager) : AuthorizationHandler<HouseholdRoleRequirement>
    {
        private readonly UserManager<AppUser> _userManager = userManager;

        protected override async Task HandleRequirementAsync(
                AuthorizationHandlerContext context,
                HouseholdRoleRequirement requirement)
        {
            var user = await _userManager.GetUserAsync(context.User);
            if (user is null || user.HouseholdId is null || user.Role is null)
                return;

            // HouseholdId from route
            var httpContext = (context.Resource as DefaultHttpContext)?.HttpContext;
            var householdIdStr = httpContext?.Request.RouteValues["householdId"]?.ToString();
            if (householdIdStr is null || !Guid.TryParse(householdIdStr, out var householdId))
                return;

            // Check if user is in this household
            if (user.HouseholdId == householdId && user.Role >= requirement.MinimumRole)
            {
                context.Succeed(requirement);
            }
        }
    }

}