public class MultipleReturnStatements {

    public int function_with_more_than_one_return(int x) {
        if (x) {
            return 2;
        }
        return 1;
    }

    private int function_with_only_one_return() {
        return 3;
    }

}