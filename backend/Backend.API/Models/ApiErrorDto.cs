namespace Backend.API.Models
{
    // At the top of your file:
    using System.Text.Json.Serialization;
    using Microsoft.AspNetCore.Mvc;

    // You can register this class in your OpenAPI schema for documentation.
    public class ApiErrorDto : ProblemDetails
    {
        /// <summary>A semantic error code (PascalCase), for clients to map to UI logic or localize.
        /// e.g. "ValidationError", "UserNotFound"</summary>
        public string? ErrorCode { get; set; }

        /// <summary>Field-level validation errors (for status 400).</summary>
        public IDictionary<string, string[]>? Errors { get; set; }

        /// <summary>UTC timestamp when error occurred.</summary>
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    }
}