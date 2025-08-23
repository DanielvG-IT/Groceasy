namespace Backend.API.Models.Dto;

public class AddMemberDto
{
  public required string UserId { get; set; }
  public required HouseholdRole Role { get; set; }
}
