try:
    with open('thisfiledoesnotexist.txt', 'r') as f:
        read_data = f.read()
except FileNotFoundError as e:
    print(e)
except Exception as e:
    print(e)
else:
    raise NameError("hi there")
finally:
    print("the end")
