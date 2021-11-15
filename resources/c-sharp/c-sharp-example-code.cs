using System;

// this code won't work at all

namespace Helper.NicerHelpers.NicestHelpers
{
    public class TestHelper
    {
        private readonly TestFunction testFunction = new TestFunction();

        public void foo()
        {
            if ("foo" != "bar")
            {
                foreach (var eventHandler in eventHandlers)
                {
                    eventHandler(this, EventArgs.Empty);
                }
            }
        }

        bool ITest.CanRun(object parameter)
        {
            return _canRun;
        }
    }
}
