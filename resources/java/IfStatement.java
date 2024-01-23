public class IfStatementsExample {

    /**
     * Example of a basic if statement.
     *
     * @param value The value to check.
     */
    public void exampleIfStatement(int value) {
        if (value > 0) {
            System.out.println(value + " is greater than 0");
        }
        if (value > 0) {
            System.out.println(value + " is greater than 0");
        } else {
            System.out.println(value + " is less than or equal to 0");
        }
        if (value > 0) {
            System.out.println(value + " is greater than 0");
        } else if (value < 0) {
            System.out.println(value + " is less than 0");
        } else {
            System.out.println(value + " is equal to 0");
        }
    }
}