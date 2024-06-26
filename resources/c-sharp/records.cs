public record House(string Address, string City);
public record Person
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
};
public readonly record struct Point(double X, double Y, double Z);
public record struct Circle
{
    public double X { get; set; }
    public double Y { get; set; }

}
public record class Ocean(string Address);
