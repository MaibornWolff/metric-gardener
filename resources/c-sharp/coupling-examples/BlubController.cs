using App.CouplingExamples.Library.Helper;

namespace App.CouplingExamplesOne
{
    public class BlubControllerOne1
    {
        public static void Main()
        {
            var helper = new Helper();
            helper.help();

            Helper.help();

            var blub = new UnknownClass();
        }
    }
    public class BlubControllerOne2
    {
        public static void Main()
        {
            Helper.help();
        }
    }
}

namespace App.CouplingExamplesTwo
{
    public class BlubControllerTwo1
    {
        public static void Main()
        {
            Helper.help();
        }
    }

    public class BlubControllerTwo2
    {
        public static void Main()
        {
            Helper.help();
        }
    }
}
