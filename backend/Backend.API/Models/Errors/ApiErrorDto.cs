using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Models.Errors
{
    public class ApiErrorDto : ProblemDetails
    {
        /// <summary>
        /// A semantic error code (PascalCase), for clients to map to UI logic or localize.
        /// </summary>
        public string? ErrorCode { get; set; }

        /// <summary>
        /// UTC timestamp when error occurred.
        /// </summary>
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    }
}