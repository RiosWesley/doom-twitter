#!/bin/sh
# Compiles engine/ to WebAssembly inside Docker (no local emsdk needed) and assembles dist/ for static hosting.
# After editing configure.ac or a header, delete engine/Makefile to force a full rebuild.
set -e
cd "$(dirname "$0")"
ROOT=$(pwd -W 2>/dev/null || pwd) # Git Bash on Windows needs the C:/ path for the Docker volume

# ponytail: pinned to emsdk 3.1.20 because the engine uses flags that newer Emscripten removed.
MSYS_NO_PATHCONV=1 docker run --rm -v "$ROOT/engine:/src" -w /src emscripten/emsdk:3.1.20 sh -c '
  set -e
  command -v automake >/dev/null || { apt-get update -qq && apt-get install -y -qq automake autoconf pkg-config >/dev/null; }
  [ -f Makefile ] || { emconfigure autoreconf -fiv && ac_cv_exeext=".html" emconfigure ./configure --host=none-none-none; }
  emmake make -j"$(nproc)"'

# The shareware IWAD may only be redistributed unmodified: refuse to ship anything but v1.9.
echo "5b2e249b9c5133ec987b3ea77596381dc0d6bc1d  wad/doom1.wad" | sha1sum -c -

rm -rf dist
cp -r site dist
cp engine/src/websockets-doom.js engine/src/websockets-doom.wasm wad/doom1.wad dist/

# X needs absolute URLs in the card tags. SITE_URL=https://your-domain ./build.sh for a real deploy.
sed -i -e "s#__SITE_URL__#${SITE_URL:-http://localhost:8000}#g" -e "s#__SOURCE_URL__#${SOURCE_URL:-https://github.com/cloudflare/doom-wasm}#g" dist/index.html
echo "dist/ ready for ${SITE_URL:-http://localhost:8000}"
