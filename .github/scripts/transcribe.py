"""Transcribe an audio file with faster-whisper and write transcript files.

Usage: python transcribe.py <audio-file>
Writes transcript/<name>-transcript.txt (plain text, paragraph per segment)
and transcript/<name>-timestamped.txt ([HH:MM:SS] prefixed segments).
"""
import os
import sys

from faster_whisper import WhisperModel


def fmt(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}"


def main() -> None:
    audio = sys.argv[1] if len(sys.argv) > 1 else "Recording.m4a"
    stem = os.path.splitext(os.path.basename(audio))[0]

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, beam_size=5, vad_filter=True)
    print(f"audio duration: {fmt(info.duration)}", flush=True)

    os.makedirs("transcript", exist_ok=True)
    plain, timed = [], []
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        plain.append(text)
        timed.append(f"[{fmt(seg.start)} - {fmt(seg.end)}] {text}")
        print(timed[-1], flush=True)

    with open(f"transcript/{stem}-transcript.txt", "w") as f:
        f.write("\n".join(plain) + "\n")
    with open(f"transcript/{stem}-timestamped.txt", "w") as f:
        f.write("\n".join(timed) + "\n")
    print(f"wrote {len(timed)} segments", flush=True)


if __name__ == "__main__":
    main()
