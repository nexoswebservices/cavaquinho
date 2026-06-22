"""
Extract cavaquinho samples from ZIP, convert 24-bit stereo WAV -> 16-bit mono WAV.
Uses velocity layer cava59_ (medium), 17 samples.
Output: public/samples/cavaquinho/*.wav + map.json
"""

import zipfile
import wave
import io
import json
import struct
import os
import re
from collections import defaultdict

ZIP_PATH = os.path.join(os.path.dirname(__file__), "..", "PACK SAMPLES CAVAQUINHO - Kitdepontos.COm.Br.zip")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "samples", "cavaquinho")
PATTERN = re.compile(r"cava59_([A-G]#?)(\d+)")

OCTAVE_BASE = {
    "C#": 4, "D": 3, "E": 3, "F#": 3,
    "G": 3, "G#": 3, "A": 3, "A#": 3, "B": 3,
}

MAX_DURATION = 4.0
FADE_DURATION = 0.15


def convert_wav(wav_bytes: bytes) -> tuple[bytes, int]:
    """Read WAV (24-bit stereo), return 16-bit mono PCM + sample rate."""
    w = wave.open(io.BytesIO(wav_bytes))
    rate = w.getframerate()
    nch = w.getnchannels()
    sampwidth = w.getsampwidth()
    nframes = w.getnframes()
    raw = w.readframes(nframes)
    w.close()

    max_frames = int(rate * MAX_DURATION)
    n = min(nframes, max_frames)
    fade_frames = int(rate * FADE_DURATION)

    frame_size = nch * sampwidth
    out = bytearray(n * 2)

    for i in range(n):
        offset = i * frame_size

        if sampwidth == 3:
            # 24-bit little-endian signed
            b = raw[offset:offset + 3]
            left = int.from_bytes(b, "little", signed=True) if len(b) == 3 else 0
            if nch == 2:
                b2 = raw[offset + 3:offset + 6]
                right = int.from_bytes(b2, "little", signed=True) if len(b2) == 3 else 0
                mixed = (left + right) // 2
            else:
                mixed = left
            val16 = mixed >> 8
        elif sampwidth == 2:
            left = struct.unpack_from("<h", raw, offset)[0]
            if nch == 2:
                right = struct.unpack_from("<h", raw, offset + 2)[0]
                val16 = (left + right) // 2
            else:
                val16 = left
        else:
            val16 = 0

        # Fade out
        if i >= n - fade_frames:
            factor = (n - i) / fade_frames
            val16 = int(val16 * factor)

        val16 = max(-32768, min(32767, val16))
        struct.pack_into("<h", out, i * 2, val16)

    return bytes(out), rate


def save_wav(pcm: bytes, rate: int, path: str):
    """Save 16-bit mono PCM as WAV."""
    w = wave.open(path, "w")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(rate)
    w.writeframes(pcm)
    w.close()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # Clean old files
    for f in os.listdir(OUT_DIR):
        if f.endswith((".mp3", ".wav", ".json")):
            os.remove(os.path.join(OUT_DIR, f))

    z = zipfile.ZipFile(ZIP_PATH, "r")

    samples = []
    for name in z.namelist():
        basename = name.split("/")[-1].replace(" - Kitdepontos.COm.Br.wav", "")
        m = PATTERN.match(basename)
        if m:
            note = m.group(1)
            num = int(m.group(2))
            raw_data = z.read(name)
            w = wave.open(io.BytesIO(raw_data))
            duration = w.getnframes() / w.getframerate()
            w.close()
            samples.append((note, num, duration, name))

    by_note = defaultdict(list)
    for note, num, dur, name in samples:
        by_note[note].append((dur, num, name))

    sample_map = {}

    for note in sorted(by_note.keys()):
        variants = sorted(by_note[note], key=lambda x: -x[0])
        base_oct = OCTAVE_BASE.get(note, 4)

        for i, (dur, num, zip_name) in enumerate(variants):
            octave = base_oct + i
            out_name = f"{note}{octave}.wav"
            note_key = f"{note}{octave}"

            raw = z.read(zip_name)
            pcm16, rate = convert_wav(raw)

            out_path = os.path.join(OUT_DIR, out_name)
            save_wav(pcm16, rate, out_path)

            size_kb = os.path.getsize(out_path) / 1024
            out_dur = len(pcm16) / 2 / rate
            print(f"  {note_key:5s} | {dur:.1f}s -> {out_dur:.1f}s {size_kb:.0f}KB | {out_name}")

            sample_map[note_key] = {
                "file": out_name,
                "note": note,
                "octave": octave,
            }

    map_path = os.path.join(OUT_DIR, "map.json")
    with open(map_path, "w") as f:
        json.dump(sample_map, f, indent=2)

    total_size = sum(
        os.path.getsize(os.path.join(OUT_DIR, s["file"]))
        for s in sample_map.values()
    )
    print(f"\n{len(sample_map)} samples -> {total_size/1024:.0f}KB ({total_size/1024/1024:.1f}MB) total")

    z.close()


if __name__ == "__main__":
    main()
