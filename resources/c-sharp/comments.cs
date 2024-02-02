// Some License example file header comment here (not counted)
// Some License example file header comment here (not counted)
// Some License example file header comment here (not counted)

using System;

// a class description comment not counted
public class Example {
    /*
     * This line should be counted
     * This either
     * @input Some Input String (not counted line)
     */
    public void exampleMethod(string input) {
        // this comment should be conted
        // this either

        /*
            Start and end comment should be ignored, only one line to be counted here
         */

        Console.Write(input);
    }
}