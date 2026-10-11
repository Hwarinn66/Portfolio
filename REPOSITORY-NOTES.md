# Project content and provenance

Content reviewed on 15 September 2026 against Efriza Taufiqurrohman's supplied CV and Portfolio PDF, and the public repositories of [Hwarinn66](https://github.com/Hwarinn66). Repository descriptions on this website are a curated snapshot, not an automatic live GitHub feed. The glassmorphism redesign (11 October 2026) kept this content; it only regrouped it into categories (`ml`, `cv`, `iot`, `web`) and per-project technology lists derived from the evidence below, used by the filters, the toolkit and the terminal.

| Project | Repository | Evidence reviewed | Scope represented on the website |
| --- | --- | --- | --- |
| InnerSelf Cognitive | [MBTI-test](https://github.com/Hwarinn66/MBTI-test) | README, main.py, train_model.py | 32 questions, word/character TF-IDF and Logistic Regression on synthetic text, eight cognitive functions and 16 stacks, FastAPI, optional local Qwen narration |
| Smart Trash | [Smart-Trash](https://github.com/Hwarinn66/Smart-Trash) | README, predict.py, train.py | MobileNetV2, OpenCV, HTTP to ESP32 and servo, Blynk, five-frame smoothing and configured confidence threshold |
| Face Recognition Attendance | [face-recognition](https://github.com/Hwarinn66/face-recognition) | README, PROJECT ABSEN/train_model.py, client and server source | Flask/Socket.IO, three clients, MediaPipe blink check, face enrollment, MobileNetV2, JSON/CSV attendance |
| HR & Payroll System | [aplikasi](https://github.com/Hwarinn66/aplikasi) | composer.json, app/Config/Routes.php, app/Controllers/Payroll.php | CodeIgniter 4, employees, departments, positions, attendance, leave approval, payroll and payslips |
| Laptop Recommendation | [laptop-recomendation-with-binary-tree](https://github.com/Hwarinn66/laptop-recomendation-with-binary-tree) | wqdw.py | Flask ProductBinaryTree and filtering by price and hardware specifications |
| Hand Gesture Navigator | [gesture_hand](https://github.com/Hwarinn66/gesture_hand) | gggg.py | OpenCV and MediaPipe hand gestures mapped to opening websites |
| Math Game | [math-game](https://github.com/Hwarinn66/math-game) | game/game.py | Flask, random questions, three difficulty levels, correct-answer and speed scoring |

The empty repositories were not featured. The payroll application's source is in `aplikasi`; the similarly named empty repository is not used as evidence. No private datasets, face enrollment images, credentials, or application user records were copied.

The seven project visuals are animated explanatory diagrams drawn as inline SVG with CSS animation. They are not screenshots, live application integrations, or claims about project deployment. No accuracy percentages, production user counts, or commercial outcomes are asserted. The Smart Trash confidence threshold is a configuration value, not an evaluation score. InnerSelf is a prototype trained on synthetic data, and blink detection is not represented as production anti-spoofing.

Education, work history, certificate status, portrait, contact links and PDFs come from the user's supplied documents. Flutter is included from the portfolio reference. Next.js, Tailwind CSS and GSAP are identified as the stack of this portfolio website; they are not added as claims about the historical projects. The BNSP certificate remains marked as awaiting issuance.

## Assets

- The previous circuit-board scroll opening and its three generated images were removed in the redesign (11 October 2026). The background is now a CSS aurora and a canvas particle field drawn in code; there are no generated images in the repository.

- Portrait and two certificate thumbnails: extracted from the supplied documents and preserved from the original website. No generative edits.
- CV and Portfolio PDFs: original user-supplied content, published under descriptive download filenames.
- Technology logos: [Devicon](https://github.com/devicons/devicon), pinned revision `7330accdbc47e2dc0c19789a48533c4a3c50fe58`. Original SVG colors retained. Exact source URLs and SHA-256 checksums are in `public/assets/logos/sources.json`; the upstream MIT license is in the same directory.
- The Arduino logo describes the Arduino IDE ecosystem, not an official ESP32 logo. Logos identify technologies, not endorsements.
- Interface icons: [Lucide](https://lucide.dev/), ISC license, installed through `lucide-react`.
- Local fonts: Bricolage Grotesque, Instrument Sans and JetBrains Mono via Fontsource, SIL Open Font License, included with their installed packages. Fonts are served with the website and do not require a Google Fonts request.
- Trailer font: Archivo via Fontsource, SIL Open Font License.

## Trailer (12 October 2026)

- Soundtrack (`public/audio/trailer.mp3`): a remix supplied by the site owner, who cut it to length and states that he has the creator's permission to use it here. It was only re-encoded to MP3 with a short fade-out. It is not covered by this repository's license and should not be reused from here.
- Every visual in the trailer is drawn in code: SVG shapes, a density map computed in the browser (inferno colour map), generated film grain and CSS. No stock footage, photos or third-party graphics.
- The Dense Object Counter scenes follow the [penghitung](https://github.com/Hwarinn66/penghitung) README and source at commit `ca29dab` (7 October 2026): snapshot from a phone camera (IP Webcam), ROI, 1024 px tiles with 15% overlap, single-class YOLO (`0: object`), global NMS with seam checks, JSON results, and count evaluation at 10/50/100/200/300+.
- The repository states that trained weights and a real dataset are not included and that it publishes no result numbers. The trailer's objects, the count of 50, the training curve and the dataset split bars are illustrative animation, not measured results.
