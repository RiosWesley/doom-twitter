"""Renders the WAD's TITLEPIC as site/poster.png (the card image X shows before Play). Stdlib only.

Usage: python scripts/make_poster.py wad/doom1.wad site/poster.png
"""

import struct
import sys
import zlib

OUT_W, OUT_H = 1280, 960  # 320x200 stretched to 4:3, the shape DOOM had on a CRT


def read_lumps(wad):
    _, count, offset = struct.unpack_from("<4sii", wad)
    lumps = {}
    for i in range(count):
        pos, size, name = struct.unpack_from("<ii8s", wad, offset + i * 16)
        lumps[name.rstrip(b"\0").decode()] = wad[pos : pos + size]
    return lumps


def decode_picture(pic):
    """Doom picture format: column offsets, each column a list of (top, length, pixels) posts."""
    width, height = struct.unpack_from("<hh", pic)
    pixels = [[0] * width for _ in range(height)]
    for x in range(width):
        (pos,) = struct.unpack_from("<I", pic, 8 + x * 4)
        while pic[pos] != 0xFF:
            top, length = pic[pos], pic[pos + 1]
            for i in range(length):
                pixels[top + i][x] = pic[pos + 3 + i]
            pos += length + 4
    return pixels


def write_png(path, width, height, rows):
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))

    raw = b"".join(b"\0" + row for row in rows)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main(wad_path, out_path):
    with open(wad_path, "rb") as f:
        lumps = read_lumps(f.read())
    palette = lumps["PLAYPAL"][:768]
    pixels = decode_picture(lumps["TITLEPIC"])
    src_h, src_w = len(pixels), len(pixels[0])

    # Nearest-neighbour upscale: build each source row once, then repeat it.
    scaled = []
    for row in pixels:
        out = bytearray()
        for x in range(OUT_W):
            i = row[x * src_w // OUT_W] * 3
            out += palette[i : i + 3]
        scaled.append(bytes(out))
    write_png(out_path, OUT_W, OUT_H, [scaled[y * src_h // OUT_H] for y in range(OUT_H)])


if __name__ == "__main__":
    main(*sys.argv[1:3])
