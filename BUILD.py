# Build script for Transparent Twitch Chat
# Python 3

# Prepare

OUTPUT_FILE = "dist/TransparentTwitchChat.user.js"
SRC_FILE = "src/main.js"

VERSION_KEY = "// @version "

# Load info

current_version = None

with open(OUTPUT_FILE, 'r') as f:
    for line in f:
        if line.startswith(VERSION_KEY):
            current_version = line[len(VERSION_KEY):].strip()
            break

# Get version

new_version = None

if current_version is None:
    new_version = input("New version: ")
else:
    new_version = input("Current version is {}. New version: ".format(current_version))

# Build

with open(OUTPUT_FILE, 'w') as out:
    with open(SRC_FILE, 'r') as src:
        for line in src:
            out.write(line.replace("{VERSION}", new_version))

print("Done")
