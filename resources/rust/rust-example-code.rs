// Importing the standard library's io module
use std::io;

// This is a trait
trait Person {
    fn get_name(&self) -> &String;
}

// This is how you define a struct in Rust
struct Student {
    name: String,
    age: u32,
    grade: String,
}

// Implementation block, all the methods associated with Student go in here
impl Student {
    // A method to create a new student
    fn new(name: String, age: u32, grade: String) -> Student {
        Student { name, age, grade }
    }

    // A method to get student info
    fn get_info(&self) -> String {
        format!("Name: {}, Age: {}, Grade: {}", self.name, self.age, self.grade)
    }
}

// Implementing the Person trait for Student
impl Person for Student {
    fn get_name(&self) -> &String {
        &self.name
    }
}

// This is a simple function
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

/*
* block comment
*/
fn main() {
    // Control flow with if-else
    let is_student = true;
    if is_student {
        println!("This is a student.");
    } else {
        println!("This is not a student.");
    }

    // For loop
    for i in 1..5 {
        println!("This is for loop number {}", i);
    }

    // While loop
    let mut count = 0;
    while count < 5 {
        println!("This is while loop number {}", count);
        count += 1;
    }

    // Loop with break and continue
    let mut number = 0;
    loop {
        number += 1;
        if number % 2 == 0 || number % 3 == 0 {
            println!("{} is divisible by 2 or 3", number);
        }
        println!("This is loop number {}", number);
        if number == 5 {
            break;
        }
    }

    // Using the function
    greet("John");

    // Using the struct and its methods
    let student = Student::new(String::from("John"), 20, String::from("A"));
    println!("{}", student.get_info());

    // Using the trait method
    println!("Name from trait: {}", student.get_name());

    // Match-case statement
    let grade = "A";
    match grade {
        "A" | "X" => println!("Excellent!"),
        "B" => println!("Good!"),
        "C" => println!("Fair!"),
        "D" => println!("Poor!"),
        "F" => println!("Fail!"),
        _ => println!("Invalid Grade"),
    }

    // Error handling
    let result = io::stdin().read_line(&mut String::new());
    match result {
        Ok(_) => println!("Success!"),
        Err(e) => println!("Oops! Something went wrong: {}", e),
    }
}
