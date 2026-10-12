#!/usr/bin/env bash
# Build, then push only the theme files that differ from the last commit (plus the
# compiled assets) to the development theme. Never pushes to the live theme.
set -euo pipefail
THEME_ID=166898532422
STORE=pinultimate.myshopify.com

npm run -s build >/dev/null
files=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } \
  | grep -E '^(assets|config|layout|locales|sections|snippets|templates|blocks)/' | sort -u || true)
only=()
for f in $files assets/theme.css assets/theme.js; do
  [ -e "$f" ] && only+=(--only "$f")
done
shopify theme push --store "$STORE" --theme "$THEME_ID" --nodelete "${only[@]}" 2>&1 | grep -E 'pushed successfully|[Ee]rror' || true
