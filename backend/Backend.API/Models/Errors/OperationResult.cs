using Backend.API.Interfaces;

namespace Backend.API.Models.Errors
{
    /// <summary>
    /// Represents the result of an operation that can either succeed (optionally with data)
    /// or fail with one or more error messages.
    /// </summary>
    public class OperationResult<T> : IOperationResult<T>
    {
        /// <summary>
        /// Indicates whether the operation succeeded.
        /// </summary>
        public bool Succeeded { get; protected set; }

        /// <summary>
        /// Optional payload returned when the operation succeeds.
        /// </summary>
        public T? Data { get; private set; }

        /// <summary>
        /// List of error messages explaining why the operation failed.
        /// </summary>
        public ApiErrorDto Error { get; protected set; } = new();

        /// <summary>
        /// Creates a successful result without data.
        /// </summary>
        public static OperationResult<T> Success() => new() { Succeeded = true };

        /// <summary>
        /// Creates a successful result with data.
        /// </summary>
        public static OperationResult<T> Success(T data) => new() { Succeeded = true, Data = data };

        /// <summary>
        /// Creates a failed result with one or more error messages.
        /// </summary>
        public static OperationResult<T> Failed(ApiErrorDto errors)
        {
            var result = new OperationResult<T> { Succeeded = false };
            if (errors != null)
                result.Error = errors ?? new ApiErrorDto();

            return result;
        }

        public override string ToString()
            => Succeeded
                ? $"Succeeded: {Data}"
                : $"Failed: {string.Join("; ", Error)}";
    }

    /// <summary>
    /// Non-generic version of OperationResult, for void operations.
    /// </summary>
    public class OperationResult : OperationResult<object?>, IOperationResult
    {
        public new static OperationResult Success()
            => new() { Succeeded = true };

        public new static OperationResult Failed(ApiErrorDto error)
        {
            var result = new OperationResult { Succeeded = false };
            if (error != null)
                result.Error = error;

            return result;
        }
    }
}
