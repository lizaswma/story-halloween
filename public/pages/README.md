# Scene art

One folder per step. `00` is the title card; `01`–`12` are the story pages
(PRD.md §5). Until a real file exists the app shows the layer id as a dashed
placeholder box, so the app runs with an empty tree.

Every file is referenced from `src/book.ts`. Expected files:

| Folder | Files |
|---|---|
| `00` | `background.webp`, `rabbit-pumpkin.png` |
| `01` | `background.webp`, `moon.png`, `stars.png` |
| `02` | `background.webp`, `rabbit.png`, `costume-hanging.png`, `costume-ready.png` |
| `03` | `background.webp`, `rabbit-costume.png` |
| `04` | `background.webp`, `night.png`, `door-closed.png`, `door-open.png` |
| `05` | `background.webp`, `house.png`, `cat.png`, `door-closed.png`, `door-open.png` |
| `06` | `background.webp`, `cat.png`, `bag.png` |
| `07` | `background.webp`, `house.png`, `bear.png`, `door-closed.png`, `door-open.png` |
| `08` | `background.webp`, `bear.png`, `bag.png` |
| `09` | `background.webp`, `house.png`, `owl.png`, `door-closed.png`, `door-open.png` |
| `10` | `background.webp`, `owl.png`, `bag.png` |
| `11` | `background.webp`, `rabbit-home.png`, `bag-full.png` |
| `12` | `background.webp`, `room.png`, `rabbit-sleeping.png`, `lamp-on.png`, `lamp-off.png` |

Specs (PRD §8.5): 2048 px long edge, 16:10 background plates as `.webp`,
interactive layers as transparent `.png`. Layers are drawn `object-fit: contain`
over the full stage, so export each layer on a full-frame transparent canvas so it
lands in the right place.
