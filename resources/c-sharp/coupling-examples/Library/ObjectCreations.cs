using System;

using App.CouplingExamplesOne;
using App.CouplingExamplesTwo;

namespace App.CouplingExamples.Library
{
    public class ObjectCreations
    {
        private IParameterTypes[] arrayOfTypes;

        public static void help()
        {
            BlubControllerOne1 ctrl = new BlubControllerOne1();
            CouplingExamplesOne.BlubControllerOne2 ctrl = new BlubControllerOne2();
            BlubControllerTwo1 ctrl = new BlubControllerTwo1();
            CouplingExamplesTwo.BlubControllerTwo2 ctrl = new BlubControllerTwo2();
            throw new MyCustomArgumentNullException("error");

            new ParameterTypes().CombinedObjectConstructionAndMethodCall<T>()
        }
    }
}
