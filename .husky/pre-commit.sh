#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running pre-commit hook..."
npx lint-staged
