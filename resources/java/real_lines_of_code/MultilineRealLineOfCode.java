class MultiLine {
    interface MyFunctionalInterface {
        void myMethod();
    }
    String multiLineString = "This is a multi-line \n"
            + "string using escape characters.";

    String multiLineString2 = """
            This is a multi-line
            string using text blocks.
            """;
    int result = addNumbers(
            10,
            20,
            30
    );
    int[] numbers = {
            1,
            2,
            3,
            4
    };

    private static int addNumbers(int a, int b, int c) {
        return a + b + c;
    }
    private void doMultiLineLambdaExpression(){
        MyFunctionalInterface myFunction = () -> {
            System.out.println("Statement 1");
            System.out.println("Statement 2");
        };
    }
    private enum Book {
        CRIMINAL,
        NOVEL,
        SCIENCE
    }

}
public class MethodChainingExample {
    private String data;
    // A method that returns the instance for chaining
    public MethodChainingExample setData(String data) {
        this.data = data;
        return this;
    }

    public MethodChainingExample processData() {
        // Process data logic
        System.out.println("Processing data: " + data);
        return this;
    }

    public MethodChainingExample displayResult() {
        // Display result logic
        System.out.println("Displaying result: " + data);
        return this;
    }

    public static void main(String[] args) {
        MethodChainingExample example = new MethodChainingExample();

        // Method chaining across multiple lines
        example.setData("Hello")
                .processData()
                .displayResult();
    }
}