# Build script for Transparent Twitch Chat
# Python 3.6+

import re
import os

# Prepare

OUTPUT_FILE = "dist/TransparentTwitchChat.user.js"
SRC_FILE = "src/main.js"

VERSION_KEY = "// @version "

# Load info

current_version = None

try:
    with open(OUTPUT_FILE, 'r') as f:
        for line in f:
            if line.startswith(VERSION_KEY):
                current_version = line[len(VERSION_KEY):].strip()
                break
except IOError:
    pass

# Get version

new_version = None

if current_version is None:
    new_version = input("New version: ")
else:
    new_version = input(f"Current version is {current_version}. New version: ")

if not new_version:
    new_version = current_version

# Build

with open(SRC_FILE, 'r') as src:
    src_contents = src.read()

src_contents = src_contents.replace("{VERSION}", new_version, 1)

src_contents = re.sub(
    pattern = r'@#hex\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\)',
    repl    = lambda m: f'rgba({int(m.group(1), 16)},{int(m.group(2), 16)},{int(m.group(3), 16)},{int(m.group(4), 16) / 256})',
    string  = src_contents
)

src_contents = re.sub(
    pattern = r'@#hex\(([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])\)',
    repl    = lambda m: f'rgba({int(m.group(1) * 2, 16)},{int(m.group(2) * 2, 16)},{int(m.group(3) * 2, 16)},{int(m.group(4) * 2, 16) / 256})',
    string  = src_contents
)

src_contents = re.sub(
    pattern = r'@#rem{{(.*?)@#rem}}',
    repl    = lambda m: "\n".join(line for line in map(str.strip, m.group(1).splitlines()) if line and not line.startswith("//")),
    string  = src_contents,
    flags   = re.DOTALL
)

src_contents = re.sub(
    pattern = r'@#css{{(.*?)@#css}}',
    repl    = lambda m: "\n" + re.sub(r"([a-z]): ", "\\1:", m.group(1).replace("\n", "").replace(";}", "}\n").replace(" !important", "!important")),
    string  = src_contents,
    flags   = re.DOTALL
)

with open(OUTPUT_FILE, 'w') as out:
    out.write(src_contents)

if os.name == "nt":
    print("Copying to clipboard")
    os.system(f"clip < {OUTPUT_FILE}")

print("Done")
