#!/bin/bash
# F1R3FLY Website Deploy Script
# Syncs Dropbox source → local git repo → pushes to GitHub Pages
#
# Usage: ./deploy.sh "your commit message here"
# Run from the 08 Website Rebuild folder or anywhere — paths are absolute.

set -e

DROPBOX_DIR="$HOME/Library/CloudStorage/Dropbox/01 ACTIVE WORK/F1R3FLY PROJECTS/02 F1R3FLY Website/08 Website Rebuild"
GIT_REPO="$HOME/git-repos/f1r3fly-io-website"

# Require a commit message
if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh \"your commit message\""
  exit 1
fi

COMMIT_MSG="$1"

echo "=== Step 1: Syncing Dropbox → git repo ==="
rsync -av --delete \
  --exclude='.git' \
  --exclude='DEV_LOG.md' \
  --exclude='images/originals' \
  --exclude='.DS_Store' \
  --exclude='*.py' \
  --exclude='deploy.sh' \
  "$DROPBOX_DIR/" \
  "$GIT_REPO/"

echo ""
echo "=== Step 2: Restoring git-only files ==="
cd "$GIT_REPO"
git checkout HEAD -- LICENSE README.md CNAME .github scripts .gitignore

echo ""
echo "=== Step 3: Checking what changed ==="
git status

echo ""
read -p "Push these changes? (y/n) " confirm
if [ "$confirm" != "y" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "=== Step 4: Committing and pushing ==="
git add -A
git commit -m "$COMMIT_MSG"
git push origin main

echo ""
echo "=== Done. Site will be live at f1r3fly.io in ~2 minutes. ==="
