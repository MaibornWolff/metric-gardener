using App.CouplingExamples.Library.FunctionCalls;

namespace App.CouplingExamplesOne
{
    public class BlubControllerOne1
    {
        public static void Main()
        {
            var helper = new FunctionCalls();
            helper.help();

            FunctionCalls.help();

            var blub = new UnknownClass();
        }
    }
    public class BlubControllerOne2
    {
        public static void Main()
        {
            FunctionCalls.help();
        }
    }
}

namespace App.CouplingExamplesTwo
{
    public class BlubControllerTwo1
    {
        public static void Main()
        {
            FunctionCalls.help();
        }
    }

    public class BlubControllerTwo2
    {
        public static void Main()
        {
            FunctionCalls.help();
        }
    }
}
