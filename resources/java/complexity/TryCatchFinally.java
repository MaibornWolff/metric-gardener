public class FinallyExample {

    public static void main(String[] args) {
        try {
            int result = divide(10, 0);
        } catch (ArithmeticException ex) {
            System.err.println("ArithmeticException: " + ex.getMessage());
        } catch (CustomizedException ex) {
            System.err.println("CustomizedException: " + ex.getMessage());
        } catch (Exception ex) {
            System.err.println("Exception: " + ex.getMessage());
        } finally {
            System.out.println("Finally block executed");
        }
    }

    public static int divide(int numerator, int denominator) throws CustomizedException {
        if (denominator > 4) {
            throw new CustomizedException("Denominator cannot be more than 4");
        }else if (denominator < 2){
            return 0;
        }
        return numerator / denominator;
    }

    static class CustomizedException extends Exception {
        public CustomizedException(String message) {
            super(message);
        }
    }
}
