# DOOM in a tweet

The 1993 DOOM shareware episode, compiled to WebAssembly and playable inside a post on X.

X turns a link whose page has `twitter:card=player` meta tags into a card that loads `twitter:player` in an
`<iframe>` inside the post. Here that iframe (`/embed/`) runs DOOM instead of a video.

| Path | What |
|---|---|
| `engine/` | Vendored [cloudflare/doom-wasm](https://github.com/cloudflare/doom-wasm) (Chocolate Doom for Emscripten, GPLv2). Changes are marked `doom-twitter:` |
| `wad/doom1.wad` | Official shareware IWAD v1.9, unmodified (SHA-1 checked by `build.sh`) |
| `site/index.html` | The link you post: card meta tags, plus the game full page |
| `site/embed/` | The iframe X loads inside the post. `_headers` lets only x.com/twitter.com frame it |
| `site/js/` | Player shell: `main` (click to play), `loader`, `engine` (boot), `input`, `touch`, `focus` (pause when unfocused) |
| `site/*.cfg` | Controls and video settings (`default.cfg` vanilla keys, `extra.cfg` Chocolate Doom options) |
| `scripts/make_poster.py` | Renders `site/poster.png` (the card image) from the WAD's title screen |

Engine changes: no debug info (2 MB instead of 7 MB of Wasm), auto-pause while the window is unfocused, and OPL
music that no longer freezes the tab at startup.

## Build

Needs Docker (the build runs in the emsdk image) and a POSIX shell (Git Bash on Windows).

```sh
SITE_URL=https://your-project.pages.dev ./build.sh   # → dist/
python -m http.server -d dist 8000
```

After changing `configure.ac` or a header, delete `engine/Makefile` to force a full rebuild.

## Deploy (Cloudflare Pages)

```sh
npx wrangler login
npx wrangler pages deploy dist --project-name your-project
```

## Posting

1. Post `https://<site>/` first from a test account to check that X shows the playable card.
2. X caches cards for about a week. Add `?v=2` (and so on) to the link to force a fresh crawl.

DOOM © 1993 id Software. Not affiliated with id Software or X.
