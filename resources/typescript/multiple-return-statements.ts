
class MultipleReturnStatements {

    public function_with_more_than_one_return(x, y): number {
        if (x) {
            return 2;
        }
        return 1;
    }

    private function_with_only_one_return() {
        return 2;
    }
}
