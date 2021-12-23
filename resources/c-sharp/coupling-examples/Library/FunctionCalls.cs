using System;

using App.CouplingExamplesOne.BlubControllerOne1;
using CEOT = App.CouplingExamplesOne.BlubControllerOne2;
using App.CouplingExamplesTwo;

// Nested Namespace not supported
namespace App.CouplingExamples.Library
{
    public class FunctionCalls
    {
        public FunctionCalls(ParameterTypes parameterTypes)
        {
        }

        public static void help()
        {
            Console.WriteLine("Helping...");
            BlubControllerTwo1.Main();
            BlubControllerOne1.Main();
            CEOT.Main();

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
