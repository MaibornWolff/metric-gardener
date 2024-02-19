# This is how you define a class in Ruby
class Student
  attr_accessor :name, :age, :grade

  # Constructor
  def initialize(name, age, grade)
    @name = name
    @age = age
    @grade = grade
  end

  # A method to get student info
  def get_info
    "Name: #{@name}, Age: #{@age}, Grade: #{@grade}"
  end
end

# This is a simple function
def greet(name)
  puts "Hello, #{name}!"
end

# Control flow with if-elsif-else
is_student = true
if is_student
  puts "This is a student."
elsif is_student == false
  puts "This is not a student."
else
  puts "Unknown."
end

# For loop
for i in 1..5
  puts "This is for loop number #{i}"
end

# While loop
count = 0
while count < 5
  puts "This is while loop number #{count}"
  count += 1
end

# Until loop
count = 0
until count == 5
  puts "This is until loop number #{count}"
  count += 1
end

# Each loop
(1..5).each do |i|
  puts "This is each loop number #{i}"
end

# Using the function
greet("John")

# Using the class and its methods
student = Student.new("John", 20, "A")
puts student.get_info

# Case statement
grade = "A"
case grade
when "A", "X"
  puts "Excellent!"
when "B"
  puts "Good!"
when "C"
  puts "Fair!"
when "D"
  puts "Poor!"
when "F"
  puts "Fail!"
else
  puts "Invalid Grade"
end

# Lambda function
square = ->(x) { x**2 }
puts "Square of 5 is #{square.call(5)}"

# Error handling
begin
  # some risky operation here
rescue => e
  puts "Oops! Something went wrong: #{e}"
end