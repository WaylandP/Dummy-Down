#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/gstack-env.sh"

dummy_down_gstack_revision=945ac301a91dff5db9fc1ddaea5b77828eeca2ed
dummy_down_bun_version=1.4.3
mkdir -p "$dummy_down_tool_root" "$GSTACK_HOME"

if [[ ! -x "$dummy_down_tool_root/bun-runtime/node_modules/@oven/bun-linux-x64/bin/bun" ]]; then
  if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
    echo 'This cloud bootstrap supports Linux x64. Use upstream gstack setup for other platforms.' >&2
    exit 1
  fi
  npm --cache "$dummy_down_repo_root/.npm" install \
    --prefix "$dummy_down_tool_root/bun-runtime" --ignore-scripts --no-audit --no-fund \
    "@oven/bun-linux-x64@$dummy_down_bun_version"
fi
if [[ "$(bun --version)" != "$dummy_down_bun_version" ]]; then
  echo 'Existing Bun runtime differs from the reviewed pin; preserving it.' >&2
  exit 1
fi

if [[ ! -d "$DUMMY_DOWN_GSTACK_SOURCE/.git" ]]; then
  if [[ -e "$DUMMY_DOWN_GSTACK_SOURCE" ]]; then
    echo "Preserving an existing non-checkout path: $DUMMY_DOWN_GSTACK_SOURCE" >&2
    exit 1
  fi
  git clone --depth 1 --no-checkout https://github.com/garrytan/gstack.git "$DUMMY_DOWN_GSTACK_SOURCE"
  git -C "$DUMMY_DOWN_GSTACK_SOURCE" fetch --depth 1 origin "$dummy_down_gstack_revision"
  git -C "$DUMMY_DOWN_GSTACK_SOURCE" checkout --detach "$dummy_down_gstack_revision"
fi
if [[ "$(git -C "$DUMMY_DOWN_GSTACK_SOURCE" rev-parse HEAD)" != "$dummy_down_gstack_revision" ]]; then
  echo 'Existing gstack checkout differs from the reviewed pin; preserving it. See docs/GSTACK.md.' >&2
  exit 1
fi

"$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-config" set telemetry off
"$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-config" set auto_upgrade false
"$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-config" set update_check false
"$DUMMY_DOWN_GSTACK_SOURCE/bin/gstack-config" set codex_reviews disabled

mkdir -p "$dummy_down_repo_root/.claude/skills"
dummy_down_source_link="$dummy_down_repo_root/.claude/skills/gstack"
if [[ -e "$dummy_down_source_link" || -L "$dummy_down_source_link" ]]; then
  if [[ "$(readlink -f "$dummy_down_source_link")" != "$DUMMY_DOWN_GSTACK_SOURCE" ]]; then
    echo "Preserving an existing skill installation: $dummy_down_source_link" >&2
    exit 1
  fi
else
  ln -s "$DUMMY_DOWN_GSTACK_SOURCE" "$dummy_down_source_link"
fi

if [[ ! -d "$DUMMY_DOWN_GSTACK_SOURCE/node_modules/playwright" ]]; then
  (cd "$DUMMY_DOWN_GSTACK_SOURCE" && bun install --frozen-lockfile)
fi
if [[ ! -f "$GSTACK_ROOT/SKILL.md" || ! -x "$GSTACK_ROOT/browse/dist/browse" ]]; then
  "$dummy_down_source_link/setup" --host codex --prefix --no-browser \
    --no-plan-tune-hooks --no-timeline-stop-hook
fi

# The upstream minimal Codex runtime omits dependencies, while its browser
# readiness probe resolves Playwright from that runtime. Link the retained copy.
if [[ ! -e "$GSTACK_ROOT/node_modules" ]]; then
  ln -s "$DUMMY_DOWN_GSTACK_SOURCE/node_modules" "$GSTACK_ROOT/node_modules"
fi
# Keep the supported custom-Chromium probe local. The upstream check currently
# ignores GSTACK_CHROMIUM_PATH and attempts a bundled-browser download instead.
dummy_down_integration_root="$dummy_down_repo_root/.gstack/integration"
if [[ -L "$GSTACK_ROOT/bin" ]]; then
  if [[ "$(readlink -f "$GSTACK_ROOT/bin")" != "$DUMMY_DOWN_GSTACK_SOURCE/bin" ]]; then
    echo 'Preserving an unexpected runtime bin link.' >&2
    exit 1
  fi
  rm "$GSTACK_ROOT/bin"
  mkdir "$GSTACK_ROOT/bin"
  for dummy_down_bin_asset in "$DUMMY_DOWN_GSTACK_SOURCE/bin/"*; do
    ln -s "$dummy_down_bin_asset" "$GSTACK_ROOT/bin/$(basename "$dummy_down_bin_asset")"
  done
  rm "$GSTACK_ROOT/bin/gstack-browser-ensure"
  ln -s "$dummy_down_repo_root/scripts/check-gstack-browser.sh" "$GSTACK_ROOT/bin/gstack-browser-ensure"
fi
dummy_down_current_probe="$(readlink -f "$GSTACK_ROOT/bin/gstack-browser-ensure")"
if [[ "$dummy_down_current_probe" != "$dummy_down_repo_root/scripts/check-gstack-browser.sh" && "$dummy_down_current_probe" != "$dummy_down_integration_root/check-gstack-browser.sh" ]]; then
  echo 'Preserving an unexpected browser readiness helper.' >&2
  exit 1
fi
mkdir -p "$dummy_down_integration_root"
cp "$dummy_down_repo_root/scripts/gstack-env.sh" \
  "$dummy_down_repo_root/scripts/check-gstack-browser.sh" \
  "$dummy_down_repo_root/scripts/check-gstack-browser.mjs" "$dummy_down_integration_root/"
chmod +x "$dummy_down_integration_root/check-gstack-browser.sh"
if [[ "$dummy_down_current_probe" != "$dummy_down_integration_root/check-gstack-browser.sh" ]]; then
  rm "$GSTACK_ROOT/bin/gstack-browser-ensure"
  ln -s "$dummy_down_integration_root/check-gstack-browser.sh" "$GSTACK_ROOT/bin/gstack-browser-ensure"
fi
# Runtime files stay private across branch switches, even before this PR merges.
dummy_down_git_exclude="$(git -C "$dummy_down_repo_root" rev-parse --git-path info/exclude)"
for dummy_down_ignore in '/.agents/skills/' '/.claude/skills/' '/.gstack/'; do
  if ! rg -q -F -x "$dummy_down_ignore" "$dummy_down_git_exclude"; then
    printf '\n%s\n' "$dummy_down_ignore" >> "$dummy_down_git_exclude"
  fi
done
if [[ -z "${GSTACK_CHROMIUM_PATH:-}" ]] && ! "$GSTACK_ROOT/bin/gstack-browser-ensure" --check >/dev/null 2>&1; then
  node "$DUMMY_DOWN_GSTACK_SOURCE/node_modules/playwright/cli.js" install chromium
fi
"$dummy_down_source_link/setup" --status
"$GSTACK_ROOT/bin/gstack-browser-ensure" --check
