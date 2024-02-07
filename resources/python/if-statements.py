a = False
b = True

if a or b:
    print("Something is true!")

    if a and b:
        print("All true")
    elif a:
        print("a is true")
    else:
        print("b is true")
else:
    print("Everything you say is false!")

is_nice = True
state = "nice" if is_nice else "not nice"

print("End of file")
