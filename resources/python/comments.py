# -*- coding: utf-8 -*-
"""A module-level docstring

Notice the comment above the docstring specifying the encoding.
Docstrings do appear in the bytecode, so you can access this through
the ``__doc__`` attribute. This is also what you'll see if you call
help() on a module or any other Python object.
"""

class MyClass:
    """docstring for a simple example class"""
    def hello(self):
        print("hello world!")  # this is an inline comment

a = """This
is
a
multiline string
"""

# some comment here
b = 123

