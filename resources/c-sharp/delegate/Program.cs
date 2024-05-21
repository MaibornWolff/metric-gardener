using System;
using DelegateNamespace;
namespace ProgramNamespace
{
    public class Program
    {
        // Define a static method
        public static void MyMethod(string message)
        {
            Console.WriteLine("MyMethod: " + message);
        }

        public static void Main()
        {
            // Instantiate the delegate
            MyDelegate del = MyMethod;

            // Call the method through the delegate
            del("Hello, world!");
        }
    }
}
