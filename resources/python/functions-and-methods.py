class MyClass:
    no_of_students = 10
    def __init__(self, name):
        self.name = name

    def hello(self):
        return "hello"

    # protected member function
    def _protectedFunction(self):
        print("he attac he protec")


    # private member function
    def __privateFunction(self):
        print("respect my authority")

    @classmethod
       def add_a_student(cls):
           cls.no_of_students += 1

    @staticmethod
      def dob_format(raw_date):
          return raw_date.replace("-", "/")

def someregularfunction(x):
    return x * x

var = someregularfunction

upper = lambda string: string.upper()
(lambda x: x + 1)(2)
exec("def my_function(arg1, arg2):\n    return arg1 + arg2")
