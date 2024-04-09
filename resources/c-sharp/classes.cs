using System;

public class Test {

    public class Test1 {}

    private class Test2 {}

    protected internal class Test3 {}

    static void Main(string[] args)
    {
        // Display the number of command line arguments.
        Console.WriteLine(args.Length);
    }

}

class AnotherTest {}

internal class InternalClassTest {}

interface Animal
{
  void animalSound(); // interface method (does not have a body)
  void run(); // interface method (does not have a body)
}

public abstract class Country
{
    public abstract string Currency { get; }

    public virtual void Move()
    {
        Console.WriteLine("Moving...");
    }
}
enum Level
{
  Low,
  Medium,
  High
}
