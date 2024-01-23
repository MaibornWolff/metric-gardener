public class LambdaExample {

    // Functional interface with a single abstract method
    interface MyFunctionalInterface {
        void myMethod();
    }

    /**
     * Method that uses a lambda expression to implement the functional interface.
     *
     * @param function The lambda expression representing the implementation of the functional interface.
     */
    public void performAction(MyFunctionalInterface function) {
        System.out.println("Performing an action before lambda expression");
        function.myMethod(); // Invoking the lambda expression
        System.out.println("Performing an action after lambda expression");
    }

    /**
     * Main method to demonstrate the usage of a lambda expression in the class.
     *
     * @param args Command-line arguments (not used in this example).
     */
    public static void main(String[] args) {
        LambdaExample example = new LambdaExample();

        // Using a lambda expression as an argument
        example.performAction(() -> System.out.println("Executing the lambda expression"));

        // Using a lambda expression with multiple statements
        example.performAction(() -> {
            System.out.println("Executing the lambda expression with multiple statements");
            System.out.println("Statement 2");
        });
    }
}