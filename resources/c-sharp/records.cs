public record House(string Address, string City);
public record Person
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
};
public readonly record struct Point(double X, double Y, double Z);
public record struct Circle
{
    public double X { get; init; }
    public double Y { get; init; }

}