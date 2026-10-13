#!/usr/bin/env bash
set -euo pipefail
dummy_down_probe_source="$(readlink -f "${BASH_SOURCE[0]}")"
source "$(dirname "$dummy_down_probe_source")/gstack-env.sh"

# Preserve upstream behavior when no custom Chromium is configured, or when
# handling flags outside the custom probe's --check/--quiet contract.
for dummy_down_probe_flag in "$@"; do
  case "$dummy_down_probe_flag" in
    --check|--quiet) ;;
    *) exec "$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-browser-ensure" "$@" ;;
  esac
done
if [[ -z "${GSTACK_CHROMIUM_PATH:-}" ]]; then
  exec "$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-browser-ensure" "$@"
fi
node "$(dirname "$dummy_down_probe_source")/check-gstack-browser.mjs"
