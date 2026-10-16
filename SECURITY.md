# Security policy

Cipher & Chalk is a static site with no accounts, no backend and no stored
visitor data. Everything that runs is in this repository, and the live site at
https://cipherandchalk.vercel.app deploys from `main`.

## Report a vulnerability

Please report security problems privately, not in a public issue: open this
repository's **Security** tab and choose **Report a vulnerability**. Say what
you found, where (a page address or a file), and how to reproduce it. You can
expect a first reply within a week.

## What counts

- Anything that lets a page run script it shouldn't, or load content from a
  host the site doesn't intend.
- Anything that sends a visitor's search text, answers, shared links or chalk
  marks anywhere, or that breaks the analytics rules in
  [docs/USAGE.md](docs/USAGE.md) (production only, eight public paths, no
  queries or fragments, Do Not Track and Global Privacy Control honored).
- A dependency or build step that could put untrusted code on the site.

Problems in GitHub, Vercel or other services themselves belong with those
providers.

## Please don't send

Controlled Unclassified Information, real assessment evidence, credentials or
personal data, in a report or anywhere else in this project. It is never
needed.
