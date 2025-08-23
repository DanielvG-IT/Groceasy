using Backend.API.Models;
using Backend.API.Models.Auth;
using Backend.API.Models.Errors;
using Microsoft.AspNetCore.Identity;

namespace Backend.API.Interfaces
{
    /// <summary>
    /// Defines authentication-related operations such as user registration and login.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user with the provided registration details.
        /// </summary>
        /// <param name="model">The registration details for the new user.</param>
        /// <returns>
        /// A <see cref="Task"/> that represents the asynchronous operation, containing an <see cref="IdentityResult"/>
        /// indicating the outcome of the registration.
        /// </returns>
        Task<IOperationResult> RegisterAsync(RegisterModel model);

        /// <summary>
        /// Authenticates a user with the provided login credentials.
        /// </summary>
        /// <param name="model">The login credentials of the user.</param>
        /// <returns>
        /// A <see cref="Task"/> that represents the asynchronous operation, containing a <see cref="TokenResponseDto"/>
        /// if authentication is successful; otherwise, <c>null</c>.
        /// </returns>
        Task<IOperationResult<TokenResponseDto?>> LoginAsync(LoginModel model, string clientIp);

        /// <summary>
        /// Refreshes the authentication token for the specified user using the provided refresh token.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose token is to be refreshed.</param>
        /// <param name="refreshToken">The refresh token used to obtain a new authentication token.</param>
        /// <returns>
        /// A <see cref="TokenResponseDto"/> containing the new authentication token if the refresh is successful; otherwise, <c>null</c>.
        /// </returns>
        Task<IOperationResult<TokenResponseDto?>> RefreshAccessToken(string refreshToken, string clientIp);

        /// <summary>
        /// Logs out a user by invalidating the provided refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token to be invalidated.</param>
        /// <param name="requestIp">The IP address from which the logout request originated.</param>
        /// <param name="reason">The reason for the logout.</param>
        /// <returns>
        /// A <see cref="Task"/> that represents the asynchronous operation, containing an <see cref="IOperationResult"/>
        /// indicating the outcome of the logout operation.
        /// </returns>
        Task<IOperationResult> LogoutWithRefreshTokenAsync(string refreshToken, string requestIp, string reason);

        /// <summary>
        /// Logs out a user by invalidating the provided access token.
        /// </summary>
        /// <param name="accessToken">The access token to be invalidated.</param>
        /// <param name="requestIp">The IP address from which the logout request originated.</param>
        /// <param name="reason">The reason for the logout.</param>
        /// <returns>
        /// A <see cref="Task"/> that represents the asynchronous operation, containing an <see cref="IOperationResult"/>
        /// indicating the outcome of the logout operation.
        /// </returns>
        Task<IOperationResult> LogoutWithAccessTokenAsync(string accessToken, string requestIp, string reason);

        /// <summary>
        /// Retrieves a user by their unique identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to retrieve.</param>
        /// <returns>
        /// A <see cref="Task"/> that represents the asynchronous operation, containing an <see cref="AppUser"/>
        /// if the user is found; otherwise, <c>null</c>.
        /// </returns>
        Task<IOperationResult<AppUser?>> GetUserByIdAsync(string userId);
    }
}