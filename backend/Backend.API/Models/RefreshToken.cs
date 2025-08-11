using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("RefreshTokens")]
    public class RefreshToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = default!;

        [Required]
        public string TokenHash { get; set; } = default!; // SHA256 hex

        [Required]
        public DateTime Expires { get; set; }

        [Required]
        public DateTime Created { get; set; }

        public string? CreatedByIp { get; set; }

        public DateTime? Revoked { get; set; }

        public string? RevokedByIp { get; set; }

        public string? ReplacedByTokenHash { get; set; }

        [NotMapped]
        public bool IsActive => Revoked == null && !IsExpired;

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= Expires;
    }
}