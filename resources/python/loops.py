list = ['One', 'Two', 'Three']

# For-loop to iterate over the list:
for item in list:
    # Nested loop to iterate over characters:
    for chara in item:
        print(chara)

for item in list:
    print(item)
else:
    print('hello')

while True:
    for i in range(10):
        print(i)
    break

num = 0
while num < 3:
    num+=1
else:
    print("end")
