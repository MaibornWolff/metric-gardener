class MultipleReturnStatements {
    function_with_more_than_one_return(x) {  // complexity +1
        if (x) {  // complexity +1
            return 2;
        }
        return 1;
    }

    function_with_only_one_return() {  // complexity +1
        return 2;
    }
}
