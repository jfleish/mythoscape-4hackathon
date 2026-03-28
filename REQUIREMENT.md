# REQUIREMENT.md

# Interactive Book Worlds — Product Requirements

## 1. Overview

Build a web experience using World Labs Marble to create two connected interactive 3D scenes:

1. **Library Scene**: a stylized interactive library where the user can browse and select a book.
2. **Book Scene**: an immersive 3D world representing the selected book's setting or a key scene from the book.

When the user picks a book in the library, they are teleported into the corresponding book world. In the book world, the user should be able to:

- explore the scene visually,
- read book text,
- listen to narrated audio,
- return to the library and choose another book.

This product uses Marble as the world-generation layer and a web renderer for final interaction.

---

## 2. Goal

Create a compelling demo / MVP that showcases how World Labs Marble can power interactive narrative experiences on the web.

The experience should make users feel that they are:

- entering a magical library,
- selecting a story physically,
- stepping inside the world of that story,
- consuming the story through synchronized visual, text, and audio layers.

---

## 3. Primary Use Case

A user opens the website and lands inside a 3D library.

- The user looks around the library.
- The user approaches or clicks a book.
- The selected book animates/highlights.
- The application transitions or teleports the user into the selected book's 3D scene.
- The user reads excerpts from the book while audio narration plays.
- The user can pause audio, navigate text, and return to the library.

---

## 4. Scope

### In Scope

- One interactive **library hub scene**.
- At least one interactive **book world scene**.
- Book selection interaction.
- Teleport / transition between scenes.
- On-screen reading experience for book text.
- Audio narration playback.
- Web delivery.
- Marble-based world generation and world asset retrieval.

### Out of Scope (MVP)

- Full-length book reader with complete publication support.
- Multiplayer/shared presence.
- User-generated books.
- Commerce or purchasing.
- In-world NPC conversations.
- Full branching story gameplay.

---

## 5. Assumptions

- The experience is delivered as a browser-based application.
- The library scene and book scenes can be pre-generated and cached rather than generated live for every user session.
- Book text and audio are available through either licensed content, public-domain content, or demo content.
- The visual experience is primarily scene exploration plus reading/listening, not complex gameplay.

---

## 6. User Stories

### Reader / Visitor

- As a user, I want to enter a beautiful library so the experience feels magical and curated.
- As a user, I want to select a book naturally so I feel like I am choosing a world.
- As a user, I want to be transported into the world of the book so I feel immersed.
- As a user, I want to read text while inside the scene so I can follow the story.
- As a user, I want audio narration so I can listen instead of or while reading.
- As a user, I want to return to the library easily so I can try another book.

### Content / Admin

- As an admin, I want to define a book, scene prompt, text excerpt, and audio asset so I can publish a complete experience.
- As an admin, I want to pre-generate scenes and attach them to book metadata so the experience loads quickly.

---

## 7. Experience Flow

### Flow A: Enter Library

1. User opens the site.
2. App loads the library world.
3. User sees clickable / selectable books.
4. User can hover, focus, or click on a book.

### Flow B: Enter Book World

1. User selects a book.
2. App plays a transition animation or fade.
3. App loads the corresponding book world.
4. App places the user into the immersive scene.
5. Text UI and audio controls appear.

### Flow C: Read and Listen

1. User sees current excerpt / passage.
2. User presses play for narration.
3. Audio plays while text is visible.
4. Optional: currently spoken paragraph is highlighted.
5. User can pause, seek, or move to next excerpt.

### Flow D: Return

1. User presses “Back to Library”.
2. App transitions back to the library scene.
3. User can select a different book.

---

## 8. Functional Requirements

## 8.1 Library Scene

The system must:

- render a 3D library scene in the browser;
- display at least 3 selectable books in MVP, even if only 1 has a fully implemented book-world scene initially;
- allow click, tap, or keyboard selection of a book;
- show clear visual affordance on hover/focus/selection;
- attach metadata to each book:
  - book id,
  - title,
  - author,
  - cover image or cover proxy,
  - target world id,
  - text asset id,
  - audio asset id.

## 8.2 Book Scene

The system must:

- load the selected book's 3D world;
- place the user at a curated spawn point;
- support camera look/move controls appropriate for desktop web;
- provide at least one return action back to the library;
- preserve the selected book context while in the scene.

## 8.3 Teleport / Transition

The system must:

- transition from library to book world in under 5 seconds after assets are available;
- show a loading state if the scene is not ready;
- support at least one of the following transition styles:
  - fade to black,
  - particle dissolve,
  - portal/book-opening effect.

## 8.4 Reading Experience

The system must:

- display book text as an overlay or anchored reading panel;
- support next/previous passage controls;
- support scroll or pagination for longer passages;
- preserve reading position per book for the active session;
- maintain readability on desktop and tablet widths.

Recommended controls:

- font size adjustment,
- light/dark text panel,
- collapse/expand text panel.

## 8.5 Audio Experience

The system must:

- play narration audio for the selected passage or chapter;
- support play/pause;
- support seek/scrub;
- support volume adjustment;
- support playback speed 0.75x / 1x / 1.25x / 1.5x.

Preferred stretch goal:

- sync paragraph highlighting with narration timing.

## 8.6 Scene Interaction

The MVP should support light interaction inside the book world, such as:

- hotspot-based points of interest,
- ambient audio,
- simple object highlights,
- a “continue reading” anchor location.

The MVP does not require complex physics gameplay.

---

## 9. Marble API Requirements

The application should use Marble APIs as follows:

### 9.1 World Generation

Use world generation to create:

- the library hub scene,
- one or more book scenes.

The generation pipeline should support:

- text prompt input,
- optional image/multi-image/video references,
- scene metadata such as display name and tags.

**Required endpoint**

- `POST /marble/v1/worlds:generate`

### 9.2 Async Operation Tracking

The system must poll generation jobs until complete.

**Required endpoint**

- `GET /marble/v1/operations/{operation_id}`

### 9.3 World Retrieval

The system must retrieve the final world asset bundle after generation.

Expected retrieved assets include:

- Gaussian splat assets,
- collider mesh,
- panorama / thumbnail,
- world metadata.

**Required endpoint**

- `GET /marble/v1/worlds/{world_id}`

### 9.4 Media Upload for Input References

If the team uses local concept art, book cover images, or source video as generation inputs, the system must support upload preparation.

**Required endpoint**

- `POST /marble/v1/media-assets:prepare_upload`

### 9.5 World Management

For internal tools or content CMS flows, the system should support listing previously generated worlds.

**Recommended endpoint**

- `POST /marble/v1/worlds:list`

---

## 10. Rendering / Frontend Requirements

The frontend should:

- run in a modern desktop browser;
- render Marble world assets in real time;
- support overlay UI for reading and audio controls;
- support pointer and keyboard navigation.

Recommended stack:

- **Frontend**: Next.js or React
- **3D renderer**: SparkJS + THREE.js
- **Backend**: Node.js / Next.js server routes
- **Hosting**: Vercel, Cloudflare, or similar

### Security Requirement

- Marble API keys must never be exposed in the client.
- All Marble API calls requiring secrets must run server-side.

---

## 11. Content Model

Each book record should include:

```json
{
  "bookId": "string",
  "title": "string",
  "author": "string",
  "coverImageUrl": "string",
  "libraryPlacement": "string",
  "worldId": "string",
  "sceneTitle": "string",
  "scenePrompt": "string",
  "passages": [
    {
      "passageId": "string",
      "text": "string",
      "audioUrl": "string",
      "startTimeMs": 0,
      "endTimeMs": 0
    }
  ]
}
```

---

## 12. Suggested System Components

### 12.1 Frontend App

Responsibilities:

- render current scene,
- manage scene transitions,
- display reading UI,
- play narration audio,
- send analytics events.

### 12.2 Application Backend

Responsibilities:

- authenticate requests,
- call Marble APIs,
- store book metadata,
- map books to world ids,
- return scene manifests to client,
- optionally manage caching and CDN URLs.

### 12.3 Content CMS / Admin Tool

Responsibilities:

- create/update book records,
- attach prompts and world ids,
- upload and manage audio,
- preview scene manifests.

---

## 13. Admin Workflow

1. Admin selects a book.
2. Admin writes or imports a scene prompt.
3. Admin optionally uploads reference images/video.
4. Backend calls Marble generation.
5. Backend stores `operation_id`, waits for completion, then stores `world_id` and asset metadata.
6. Admin uploads book text passages and audio.
7. Admin publishes the book entry to the library.

---

## 14. UX Requirements

The experience should feel cinematic, calm, and legible.

### Library UX

- The scene should invite exploration.
- Books should be easy to identify and select.
- There should be minimal clutter in the interaction model.

### Book World UX

- The environment should match the tone of the book.
- Text should never fully block the visual scene by default.
- Audio controls should be persistent but unobtrusive.
- Return-to-library action should always be visible.

---

## 15. Accessibility Requirements

The system should:

- support keyboard navigation for core actions;
- provide captions/transcript for narrated content;
- provide sufficient contrast in text overlays;
- allow audio mute and volume control;
- avoid motion-heavy transitions without an option to reduce motion.

---

## 16. Performance Requirements

MVP targets:

- First meaningful scene load: under 8 seconds on broadband desktop.
- Transition between already-available scenes: under 3 seconds.
- Maintain interactive frame rate target of 30 FPS minimum on a modern laptop.
- Text/audio controls must respond in under 100 ms after user input.

---

## 17. Data and State Requirements

The application should store:

- selected book id,
- current scene id,
- current passage id,
- narration playback state,
- session reading progress.

Optional future persistence:

- user bookmarks,
- recently visited books,
- resume position across sessions.

---

## 18. Analytics Requirements

Track at minimum:

- library scene entered,
- book selected,
- book world entered,
- narration play/pause/completion,
- passage next/previous,
- return to library,
- session duration per book.

Success metrics:

- % of users who select a book,
- % of users who complete at least one passage,
- average dwell time in book world,
- audio play rate,
- repeat book selections.

---

## 19. Error Handling Requirements

The system must handle:

- world generation still processing,
- missing world asset URLs,
- audio load failure,
- network timeout,
- unsupported browser capabilities.

Fallbacks:

- loading screen with progress state,
- static preview image if 3D world fails,
- text-only mode if rendering fails,
- retry action for failed audio.

---

## 20. MVP Acceptance Criteria

The MVP is complete when:

1. A user can open the site and enter a 3D library scene.
2. A user can select a visible book.
3. The app transitions to a second 3D scene representing that book.
4. The user can read at least one passage in-scene.
5. The user can play and pause narration audio.
6. The user can return to the library.
7. The experience works on desktop web without exposing API keys client-side.

---

## 21. Future Enhancements

- Multiple books with distinct worlds.
- Chapter-to-chapter teleportation within one book.
- Spatial audio tied to scene events.
- AI voice narration.
- Character hotspots and lore popups.
- Save progress/login.
- Mobile/tablet optimized controls.
- VR mode.
- Personalized or dynamically generated scenes per reader.

---

## 22. Open Questions

- Will the experience use public-domain books, licensed books, or original content?
- Is each book represented by one scene, or multiple chapter scenes?
- Should narration be pre-recorded audio or generated with TTS?
- Should users freely walk in the world, or use guided camera rails / hotspots?
- How much synchronization is needed between text and audio?
- Should scene generation happen offline in a content pipeline or on demand?

---

## 23. Recommended MVP Plan

### Phase 1

- Build library scene.
- Build 1 book world.
- Add basic text panel.
- Add basic audio playback.
- Add back-to-library transition.

### Phase 2

- Add 3+ books.
- Add paragraph sync.
- Add hotspot interactions.
- Add analytics dashboard.

### Phase 3

- Add authoring/CMS flow.
- Add personalized generation pipeline.
- Add mobile optimization.

---

## 24. References

This requirement is based on the Marble starter overview and the previously identified Marble API set for generation, async operations, asset retrieval, and upload-backed workflows.
