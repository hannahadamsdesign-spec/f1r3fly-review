#!/usr/bin/env python3
"""Copy generated article HTML files from /tmp staging to Dropbox articles folder."""
import shutil, os, glob

src_dir = "/tmp/f1r3fly_articles"
dst_dir = "/Users/hannahadams/Library/CloudStorage/Dropbox/01 ACTIVE WORK/F1R3FLY PROJECTS/02 F1R3FLY Website/08 Website Rebuild/articles"

os.makedirs(dst_dir, exist_ok=True)

for f in glob.glob(os.path.join(src_dir, "*.html")):
    dst = os.path.join(dst_dir, os.path.basename(f))
    shutil.copy2(f, dst)
    print(f"  ✓ {os.path.basename(f)}")

print(f"\nDone. Copied {len(glob.glob(os.path.join(src_dir, '*.html')))} files to articles/")
