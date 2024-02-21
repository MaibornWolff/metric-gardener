class Test
  def method1
    puts "Hello!"
  end
end

test1 = Test.new
test2 = Test.new

# Override method1 only for instance test2 to make it a singleton method:
def test2.method1
    puts "Howdy!"
end

# Define new singleton method only for instance test2:
def test2.method2
    puts "Salut!"
end

test1.method1
test2.method1
test2.method2