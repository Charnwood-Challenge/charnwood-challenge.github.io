#!/usr/bin/env python3
"""Make web-sized copies of photos for the site.

Phone photos are often 3-5 MB each. This makes copies that are at most 1400
pixels on their longest side, turned the right way up, with the camera's
hidden details (time, phone model, sometimes location) removed.

Run from the repository root:

    # A gallery: also makes the thumbnails the gallery shows
    python3 scripts/prepare_photos.py images/gallery/2027 ~/Pictures/race/*.jpg

    # A single photo, e.g. for a post
    python3 scripts/prepare_photos.py images ~/Pictures/start.jpg

Needs Pillow: `sudo apt install python3-pil` on Ubuntu or WSL, or
`pip install pillow` elsewhere.
"""

import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("This needs Pillow. On Ubuntu or WSL run: sudo apt install python3-pil")

LARGE = 1400    # longest side of the photo, in pixels
THUMB = 480     # longest side of a gallery thumbnail
QUALITY = 75


def save(image, path, size, quality):
    copy = image.copy()
    copy.thumbnail((size, size), Image.LANCZOS)
    # Saving without the original's metadata leaves out the camera details
    copy.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return copy.size


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    folder, photos = sys.argv[1], sys.argv[2:]
    gallery = "gallery" in folder.split(os.sep)
    os.makedirs(folder, exist_ok=True)
    if gallery:
        os.makedirs(os.path.join(folder, "thumbs"), exist_ok=True)

    for photo in photos:
        name = os.path.splitext(os.path.basename(photo))[0].lower().replace(" ", "-") + ".jpg"
        with Image.open(photo) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")

        out = os.path.join(folder, name)
        width, height = save(image, out, LARGE, QUALITY)
        line = f"{out}: {width}x{height}, {os.path.getsize(out) // 1024} KB"

        if gallery:
            thumb = os.path.join(folder, "thumbs", name)
            save(image, thumb, THUMB, 75)
            line += f" (thumbnail {os.path.getsize(thumb) // 1024} KB)"
        print(line)


if __name__ == "__main__":
    main()
