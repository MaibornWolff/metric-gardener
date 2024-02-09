class MyClass:
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


def someregularfunction(x):
    return x * x

var = someregularfunction

upper = lambda string: string.upper()
