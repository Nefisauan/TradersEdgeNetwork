#!/bin/bash
# Boost tutorial video audio (~2.5x) while copying video stream unchanged.
set -euo pipefail

FFMPEG="${FFMPEG:-/tmp/ffmpeg}"
GAIN="${GAIN:-2.5}"
VIDEOS_DIR="$(cd "$(dirname "$0")/../videos" && pwd)"

if [[ ! -x "$FFMPEG" ]]; then
  echo "ffmpeg not found at $FFMPEG" >&2
  exit 1
fi

for file in "$VIDEOS_DIR"/*.mp4; do
  base="$(basename "$file")"
  tmp="$VIDEOS_DIR/.${base}.tmp.mp4"
  echo "Boosting audio: $base"
  "$FFMPEG" -y -i "$file" -af "volume=${GAIN}" -c:v copy -c:a aac -b:a 192k "$tmp"
  mv "$tmp" "$file"
done

echo "Done."
