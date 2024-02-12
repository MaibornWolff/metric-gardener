import java.util.function.Function;
public class SampleFunctions {
    public static void executeOperation(int value, MyFunctionalInterface operation) {
        int result = operation.performOperation(value);
        System.out.println("Operation Result: " + result);
    }

    public static int square(int num) {
        Function<Integer, Integer> squareFunction = n -> n * n;
        return squareFunction.apply(num);
    }

    public static void main(String[] args) {
        executeOperation(4, (x) -> x * 2); // Lambda expression for doubling the value

        int squaredResult = square(3);
        System.out.println("Square Result: " + squaredResult);
    }

    @FunctionalInterface
    interface MyFunctionalInterface {
        int performOperation(int value);
    }
}