const obj = {
    foo() {
        return "bar";
    },
    get latest() {
        return 3;
    },
    set current(name) {
        this.log.push(name);
    },
    *more() {
        let index = 0;
        while (true) {
            yield index++;
        }
    },
    log: [],
};
