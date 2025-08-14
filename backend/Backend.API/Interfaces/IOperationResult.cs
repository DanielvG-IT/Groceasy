using Backend.API.Models.Errors;

namespace Backend.API.Interfaces
{
    /// <summary>
    /// Represents the result of an operation that may fail or succeed without returning any data.
    /// </summary>
    public interface IOperationResult
    {
        /// <summary>
        /// Indicates whether the operation was successful.
        /// </summary>
        bool Succeeded { get; }

        /// <summary>
        /// Contains error details if the operation failed.
        /// </summary>
        ApiErrorDto Error { get; }
    }

    /// <summary>
    /// Represents the result of an operation that may fail or succeed and optionally returns data.
    /// </summary>
    /// <typeparam name="T">The type of the result data.</typeparam>
    public interface IOperationResult<T> : IOperationResult
    {
        /// <summary>
        /// Contains the result data if the operation was successful.
        /// </summary>
        T? Data { get; }
    }
}