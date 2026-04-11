#!/usr/bin/env python3
import os, json, base64, sys

# Base64-encoded F1R3Pix v4 HTML
b64 = sys.stdin.read().strip()
html = base64.b64decode(b64).decode('utf-8')

paths = [
    os.path.expanduser("~/Library/CloudStorage/Dropbox/01 ACTIVE WORK/F1R3FLY PROJECTS/05 F1R3Games/F1R3Pix/F1R3Pix-branded-v4.html"),
    os.path.expanduser("~/git-repos/f1r3fly-review/index.html"),
]
for p in paths:
    with open(p, "w") as f:
        f.write(html)
    print(f"Written {len(html)} chars to {p}")
