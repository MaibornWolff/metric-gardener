package com.example.myproject;
import java.util.*;
public class ExampleClass {
    // Member variable
    private String myString;

    /**
     * Constructor for initializing the class with a string.
     *
     * @param initialString The initial value for the `myString` variable.
     */
    public ExampleClass(String initialString) {
        this.myString = initialString;
    }

    /**
     * Getter method to retrieve the value of the `myString` variable.
     *
     * @return The current value of the `myString` variable.
     */
    public String getMyString() {
        return myString;
    }

    /**
     * Setter method to update the value of the `myString` variable.
     *
     * @param newString The new value to set for the `myString` variable.
     */
    public void setMyString(String newString) {
        this.myString = newString;
    }

    /**
     * A method to display the current value of the `myString` variable.
     */
    public void displayString() {
        System.out.println("Current value of myString: " + myString);
    }

    /**
     * Main method to demonstrate the usage of the `ExampleClass`.
     *
     * @param args Command-line arguments (not used in this example).
     */
    public static void main(String[] args) {
        ExampleClass exampleObject = new ExampleClass("Hello, World!");
        exampleObject.displayString();

        exampleObject.setMyString("Updated String");
        exampleObject.displayString();
    }

}

