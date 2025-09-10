import time

print("Python server started...")

for i in range(100000):
    print(f"Logging from Python: {i}")
    time.sleep(1)

print("Python server finished.")
