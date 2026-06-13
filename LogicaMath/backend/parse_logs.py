import re
import sys

def main():
    tb = []
    in_tb = False
    
    for line in sys.stdin:
        if "Traceback (most recent call last):" in line:
            if tb:
                print("".join(tb))
                print("-" * 50)
            tb = [line]
            in_tb = True
        elif in_tb:
            tb.append(line)
            # Check if line matches an error definition
            stripped = line.strip()
            if re.match(r"^[A-Z][a-zA-Z0-9_]*Error:|^[A-Z][a-zA-Z0-9_]*Exception:", stripped):
                print("".join(tb))
                print("-" * 50)
                tb = []
                in_tb = False
            elif any(x in line for x in ["INFO:", "WARNING:", "ERROR:", "2026-"]) and len(tb) > 5:
                # If we see info logs after a traceback has been going on for a bit, it likely ended
                print("".join(tb[:-1]))
                print("-" * 50)
                tb = []
                in_tb = False

    if tb:
        print("".join(tb))
        print("-" * 50)

if __name__ == "__main__":
    main()
