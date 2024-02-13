// Declaration
class Rectangle1 {
    constructor(height, width) {  // complexity +1
        this.height = height;
        this.width = width;
    }
}

// Expression; the class is anonymous but assigned to a variable
const rec1 = class {
    constructor(height, width) {  // complexity +1
        this.height = height;
        this.width = width;
    }
};

// Expression; the class has its own name
const rec2 = class Rectangle2 {
    constructor(height, width) {  // complexity +1
        this.height = height;
        this.width = width;
    }
};
