status = 403
flag = False
match status:
    case 400 if flag: #+2 complexity
        print("Bad request")
    case 401 | 403 | 404: #+1 complexity
        print("Not allowed")
    case 418 if flag: #+2 complexity ("if" is a guard)
        print("I'm a teapot")
    case _:
        print("Something's wrong with the internet")
