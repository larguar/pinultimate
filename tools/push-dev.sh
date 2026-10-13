#!/usr/bin/env bash
# Build, then push to the development theme. Never pushes to the live theme.
#
#   tools/push-dev.sh                 push every theme file changed since the last commit
#   tools/push-dev.sh <file> [...]    push only these files (paths relative to the repo root)
#
# Several people (or agents) can share the development theme: pass explicit files so you
# only push your own work. Remote files that don't exist locally are never deleted.
set -euo pipefail
THEME_ID=${THEME_ID:-166898532422}  # override: THEME_ID=<id> tools/push-dev.sh
STORE=pinultimate.myshopify.com
cd "$(dirname "$0")/.."

npm run -s build || echo "⚠ build reported errors (see above); pushing what was built"

if [ $# -gt 0 ]; then
  files="$*"
else
  files=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } \
    | grep -E '^(assets|config|layout|locales|sections|snippets|templates|blocks)/' | sort -u || true)
  files="$files assets/theme.css assets/theme.js"
fi

only=()
for f in $files; do
  [ -e "$f" ] && only+=(--only "$f")
done
[ ${#only[@]} -eq 0 ] && { echo "Nothing to push"; exit 0; }

shopify theme push --store "$STORE" --theme "$THEME_ID" --nodelete "${only[@]}" 2>&1 \
  | grep -E 'pushed successfully|[Ee]rror|[Ff]ailed' || true
