#!/usr/bin/env bash
# Source this file before invoking project-local gstack tools.
dummy_down_repo_root="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
dummy_down_tool_root="$(dirname "$dummy_down_repo_root")/tools"
export DUMMY_DOWN_GSTACK_SOURCE="$dummy_down_tool_root/gstack"
export GSTACK_ROOT="$dummy_down_repo_root/.agents/skills/gstack"
export GSTACK_HOME="$dummy_down_repo_root/.gstack/state"
export GSTACK_PLAN_DIR="$dummy_down_repo_root/.gstack/plans"
export BUN_INSTALL_CACHE_DIR="$dummy_down_repo_root/.gstack/bun-cache"
export PLAYWRIGHT_BROWSERS_PATH="$dummy_down_repo_root/.gstack/browsers"
export PATH="$dummy_down_tool_root/bun-runtime/node_modules/@oven/bun-linux-x64/bin:$PATH"
# Chromium runs in the cloud container; package/TLS verification stays enabled.
export GSTACK_CHROMIUM_NO_SANDBOX=1
if [[ -z "${GSTACK_CHROMIUM_PATH:-}" && -x /usr/bin/chromium ]]; then
  export GSTACK_CHROMIUM_PATH=/usr/bin/chromium
fi
export GSTACK_SETUP_SKIP_CSO_BUILD=1
export GSTACK_SKIP_FONTS=1
