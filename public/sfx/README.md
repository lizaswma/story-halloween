# Sound effects

Language-independent (PRD.md §4.1). Referenced by name from `src/book.ts`.

**These are synthesized, not recorded** — `python3 tools/make-sfx.py` regenerates
every file here (numpy + ffmpeg, deterministic, no licensing). Edit a function in
that script and re-run (`python3 tools/make-sfx.py mew` for just one) to retune a
sound. Drop a real recording over any `<name>.mp3` to replace it; the script is
only the default.

| File | Sound | Used on |
|---|---|---|
| `chime.mp3` | rising glockenspiel | p1 stars twinkle; moon/window extras on p2, p3, p5, p9–p12 |
| `sparkle.mp3` | scattered high pings | p3 — costume lights up |
| `rustle.mp3` | leaves / fabric | p2 costume; leaf, bush, hedge, tree extras |
| `creak.mp3` | slow door creak | p4 — door opens |
| `knock.mp3` | three soft wood knocks | p5 / p7 / p9 — knocking |
| `boop.mp3` | round upward bloop | p6 / p8 / p10 — sticker onto the bag |
| `count.mp3` | clean blip | p11 — per-sticker (spoken numbers come from `audio/<lang>/count/`) |
| `lullaby.mp3` | music-box tune, ~6.5 s | p12 — lamp off, bedtime |
| `flare.mp3` | warm rising glow | lamps, lanterns, candle, ceiling light |
| `pop.mp3` | soft bubble pop | porch pumpkins, 小熊 wave |
| `tap.mp3` | tiny wooden tick | boots hop, slippers tuck |
| `whoosh.mp3` | airy sweep | p2 mirror ghost |
| `whump.mp3` | soft thud | p3 bed lump |
| `mew.mp3` `purr.mp3` | kitten | p1 window peek, p6 kitten / tail |
| `squeak.mp3` | mouse | p4 mouse peek |
| `hoo.mp3` | two owl hoots | p9 owlet, p10 owl |
| `flutter.mp3` | bat wings | p9 mailbox bat |
| `yawn.mp3` | sleepy yawn | p11 ghost stretch |

Keep them short (< 1.5 s, lullaby aside), soft, non-startling. All are level-matched
to about the same loudness.
