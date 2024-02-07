try:
    with open('thisfiledoesnotexist.txt', 'r') as f:
        read_data = f.read()
except Exception as e:
    print(e)
else:
    raise NameError("hi there")
finally:
    print("the end")
