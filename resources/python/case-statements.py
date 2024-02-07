status = 403

match status:
    case 400:
        print("Bad request")
    case 401 | 403 | 404:
        print("Not allowed")
    case 418:
        print("I'm a teapot")
    case _:
        print("Something's wrong with the internet")
