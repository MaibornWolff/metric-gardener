import java.util.function.Function;
import java.util.function.Supplier;
import java.util.function.BiPredicate;
import java.util.function.Consumer;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.Arrays;
class Special{
    void printNumbers(int... numbers) {
        for (int number : numbers) {
            System.out.println(number);
        }
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        int sum = numbers.stream().reduce(0, (a, b) -> a + b);
        List<String> list = Arrays.asList("a", "b", "c");
        list.forEach(System.out::println);
        Function<String, Integer> parseIntReference = Integer::parseInt;
        Consumer<String> printlnReference = System.out::println;
        BiPredicate<String, String> startsWithReference = String::startsWith;
        Supplier<List<String>> listReference = ArrayList::new;
        Function<Integer, Integer> squareFunction = n -> n * n;
        Runnable myRunnable = new Runnable() {
            public void run() {
                // implementation
            }
        };

    }
}