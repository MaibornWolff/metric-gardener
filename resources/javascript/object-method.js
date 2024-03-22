const obj = {
    foo() { // complexity +1
        return 'bar';
    },
    get latest() {  // complexity +1
        return 3;
    },
    set current(name) { // complexity +1
        this.log.push(name);
    },
    *more() {   // complexity +1
        let index = 0;
        while (true) {  // complexity +1
            yield index++;
        }
    },
    log: [],
};
