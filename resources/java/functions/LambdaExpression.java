// Functional interface with a single abstract method (SAM)
interface MyFunctionalInterface {
    void myMethod(String s);
    void myMethod2();
}

public class LambdaExample {
    public static void main(String[] args) {
        // Using a lambda expression to implement the abstract method of the functional interface
        MyFunctionalInterface myLambda = (String s) -> System.out.println("Hello, " + s);
        MyFunctionalInterface myLambda2 = () -> System.out.println("Hello");

        // Calling the method defined in the lambda expression
        myLambda.myMethod("World");
    }
}
