# Build script for Transparent Twitch Chat
# Python 3

import shutil

# Prepare

output_file = "dist/TransparentTwitchChat.user.js"
src_file = "src/main.js"

# Build

shutil.copyfile(src_file, output_file)

# TODO - minify, add custom version prompt etc
