import random

ID_CHAR = "abcdefghijklmnopqrstuwxyz0123456789"
def generate_id(size=15,prefix=""):
    chars = []

    for _ in range(len(chars),size-len(prefix)-1):
        chars.append(ID_CHAR[random.randint(0,len(ID_CHAR)-1)])
    return f"{f"{prefix}-" if prefix else ""}{"".join(chars)}"

