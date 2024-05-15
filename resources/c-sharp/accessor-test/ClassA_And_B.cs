using static System.Console;
void PrintText()
{
    WriteLine("Hello");
}
namespace TestNamespace1
{
    public class ClassA
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }
    }
    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }
    }
}
namespace FalsyNamespace
{
    public class ClassB
    {
        public static void MyMethod()
        {
            WriteLine("Hello from ClassA's MyMethod!");
        }
    }
}
