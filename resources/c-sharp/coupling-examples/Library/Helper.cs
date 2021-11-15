using System;

using App.CouplingExamplesOne.BlubControllerOne1;
using App.CouplingExamplesTwo;

// Nested Namespace
namespace App.CouplingExamples.Library
{
    public class Helper
    {
        public static void help()
        {
            Console.WriteLine("Helping...");
            BlubControllerTwo1.Main();
        }
    }

    namespace SpecialHelper
    {
        public class SpecialHelper
        {
            public static void specialHelp()
            {
                Console.WriteLine("Helping...");
            }
        }

        namespace SpecialHelperTwo
        {
            public class SpecialHelperTwo
            {
                public static void specialHelpTwo()
                {
                    Console.WriteLine("Helping...");
                }
            }
        }
    }
}
