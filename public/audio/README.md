# Narration & counting audio

Per-page, per-language (PRD.md §4.3). The app plays these on page turn and on
tap-to-replay; missing files fail silently.

```
audio/zh/00.mp3 … 12.mp3     Mandarin narration (00 = title card)
audio/en/00.mp3 … 12.mp3     English narration
audio/zh/count/1.mp3 … 6.mp3 spoken "一…六" for the counting page
audio/en/count/1.mp3 … 6.mp3 spoken "one…six"
```

Voice plan (PRD §4.3, §9): plain TTS now → LLM-generated voices once the story
outline is locked, likely a different model for Mandarin vs. English. This folder
layout stays fixed so voices swap in without code changes.

Sentences to record are in `src/book.ts` (`PAGES[].text` and `TITLE_CARD`).
