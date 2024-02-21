require 'singleton'
class TestClass
  include Singleton
end

puts "Are the two singleton instances the same? ", TestClass.instance == TestClass.instance ? "Yes!" : "No??!";

class TestDifferent
    class<<self
        def methodA
            print "Miep? Miep!"
        end
    end
end

TestDifferent.methodA