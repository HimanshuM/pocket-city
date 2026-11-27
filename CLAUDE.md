# Pocket City

A small open-world sandbox game that runs in the browser. You walk around a stylized low-poly city, get into any car and drive, with traffic, pedestrians and a day-night cycle. The city streams in around the player in blocks, so it can keep growing.

## The goal

The long-term aim is a game that *feels* like a GTA-style open world: good-looking, alive and fun to drive around in. It is deliberately smaller and stylized, not photoreal. **Visuals and free-roam gameplay come first.** Story, missions and NPC dialogue come later, so don't build them unless asked.

## Who you're working with

- The owner is a **complete beginner** at game development and is learning as we go. Explain changes in plain language, briefly: what you changed, why, and how to see it in the game. Avoid jargon, or define it the first time you use it.
- Make **small, playable steps**. After every change the game must still load and run. Prefer a working small feature over a half-finished big one.
- The owner's PC is **modest** (it can't run GTA 6). Treat performance as a feature, not an afterthought (see "Performance budget" below).
- Commit with git after each working step, with a clear message, so it's easy to roll back.

## How to run it

- Simplest: open `index.html` directly in Chrome or Firefox.
- Better (needed once there are multiple files): from this folder, run `python3 -m http.server 8000` and open http://localhost:8000.
- Debug handle in the browser console: `window.pocketCity`, which exposes `player`, `chunks`, `traffic`, `peds`, `freeCars`, `interact()` and `setTime(0..1)`. For example, `pocketCity.setTime(0.9)` jumps to night.
- Controls: WASD/arrows to move or drive, mouse to look (click to lock the pointer), Shift to run, Space to jump or handbrake, E to enter/exit a car, hold T to fast-forward time, G to toggle graphics quality, H for help. On touch screens there's a left joystick, right-side drag to look, and Car/Run buttons.

### Checking your work

When you change something visual or behavioural, verify it actually works. Don't stop at "the code looks right":

- Run the game with headless Chrome via Playwright. Use the flags `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, so WebGL works without a GPU. Then take screenshots and look at them. Save screenshots in `screenshots/`, which is gitignored, never anywhere else in the project.
- Use `window.pocketCity` to teleport the player, enter a car, or set the time before taking a screenshot.
- Check the console for errors. A single exception in the frame loop freezes the game.
- Software rendering is very slow (~5 fps), so don't judge performance from it. Count draw calls with `renderer.info.render.calls` instead.

## Current tech

- One file, `index.html`, about 585 lines, with HTML, CSS and JS together.
- **Three.js r128**, loaded as a global `THREE` from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. No build step and no npm.
- Newer Three.js versions changed APIs (e.g. color management, `outputEncoding` → `outputColorSpace`, removal of the UMD build). Don't upgrade casually. If we upgrade, do it as part of moving to Vite + npm + ES modules (see roadmap), and recheck colors and lighting afterwards.

## Code map (sections of index.html, marked with `/* ---------- name ---------- */`)

| Section | What it does |
|---|---|
| world constants | Sizes, stream radius, seed, day length, color palettes, RNG helpers |
| renderer, scene, camera | WebGL renderer, fog, hemisphere and sun lights, gradient sky dome shader, stars |
| textures | Canvas-drawn facade texture (windows + an emissive night-window map) and road texture (lane dashes, crosswalks) |
| geometry builder | `GB` class: collects many boxes into one BufferGeometry with vertex colors |
| chunks | Block generation (`city`, `park`, `townSquare`), streaming load/unload |
| collision | Circle-vs-box and circle-vs-car pushes |
| cars | Car model, parked/free cars, traffic AI on the lane grid |
| people | Blocky person model with walk animation, pedestrians on sidewalk loops |
| player | Walking, driving physics, enter/exit car |
| day and night | Time of day → sky colors, sun/moon, window glow, lamps, headlights |
| camera | Third-person orbit camera with wall avoidance and auto-follow when driving |
| input | Keyboard, pointer lock mouse, touch joystick and buttons |
| HUD and minimap | Clock, speed, streaming stats, rotating round minimap |
| boot | Initial chunks, starter car, traffic, pedestrians, main loop |

## World layout and conventions (important, easy to break)

**Units and axes:** 1 unit = 1 metre. Y is up. The ground is at y = 0 and sidewalks/lots are raised to y = 0.2.

**Blocks ("chunks"):**
- `CH = 80`. Chunk `(cx, cz)` covers x ∈ [cx·80, (cx+1)·80] and z ∈ [cz·80, (cz+1)·80]. Its centre is `((cx+0.5)·80, (cz+0.5)·80)`, and everything inside a chunk is built in *local* coordinates around that centre.
- Roads run along every line x = k·80 and z = k·80, so every chunk edge is a road centre line. Roads are 12 m wide (`ROADW = 6` each side).
- Local layout from the chunk centre outward:
  - buildings within ±30 (`BLD`)
  - pedestrian path loop at ±32
  - street trees at ±33, lamps at the corners at ±32.8
  - curb/lot edge at ±34 (`LOT`)
  - parked cars at ±35
  - traffic lane centres at ±37 (i.e. 3 m from the road centre)
- Streaming: chunks within `R = 3` of the player's chunk are loaded, nearest first, at most 2 per frame. Chunks farther than `R + 1` are unloaded and their geometry is disposed.
- **Determinism:** a chunk is generated from `rng(hash2(cx, cz))`, available as `k.r`. The same chunk always regenerates the same way. Use only `k.r` inside generators, never `Math.random` or `R0`. Adding or removing `r()` calls changes the city layout, which is fine, but be aware of it. `R0` is the runtime RNG for traffic, pedestrians and other things that may differ every visit.
- **Hand-built blocks:** `CUSTOM['cx,cz'] = k => { ... }` overrides the generator for that chunk. `'0,0'` is the town square where the player spawns. This is the main way to add designed landmarks.

**Building geometry:** `k.B` (buildings, facade texture), `k.P` (props, vertex colors only) and `k.G` (things that glow at night) are `GB` builders. Each becomes one mesh per chunk.
- `GB.box(x, yBottom, z, sx, sy, sz, color, wall)`: **y is the bottom**, not the centre. Bottom faces are skipped.
- With `wall = true`, the faces get facade UVs. The texture is 4 × 4 window bays, one bay is 4 m wide × 3.5 m tall, so a floor is 3.5 m.

**Collision:**
- Every solid thing in a chunk is registered with `solid(k, lx, lz, halfX, halfZ, height)`, which stores `[minX, minZ, maxX, maxZ, height]` in world coordinates in `chunk.boxes`.
- Anything you add that should block the player or cars, or stop the camera from going through it, needs a `solid(...)` call.
- The player is a circle of radius 0.4. A car pushes as three circles of radius 1.05 along its length. Other cars are oriented boxes with half extents 1 × 2.25.

**Heading convention (used by player, cars, people):**
- Models face local −z. `object.rotation.y = h`.
- forward = (−sin h, −cos h), right = (cos h, −sin h).
- From a direction (fx, fz), compute `h = atan2(-fx, -fz)`.

**Traffic:**
- Traffic drives on the right. For a direction `d = (dx, dz)`, the lane centre is the road centre line plus `right(d) * 3`, where `right(d) = (-dz, dx)`.
- A car's mode is either `road` (driving between junctions, distance `s` from 6 m past the last junction) or `turn` (a quadratic Bezier through the junction).
- At each junction it picks straight (50%), left or right.
- Cars brake for the player, the player's car, parked "free" cars and other traffic ahead in their lane. Cars that have been stuck for 3.5 s ignore other traffic briefly to avoid deadlocks.
- Traffic cars are recycled when they get too far from the player.

**Cars the player can use:**
- Any car can be entered: traffic, parked or "free". A car's `src` says which list owns it, and `detach()` removes it from that list.
- A car the player leaves becomes a "free" car (teal dots on the minimap). Free cars are removed when more than 460 m away.

**Materials:**
- Most things use `MeshLambertMaterial`, which lights **per vertex**. Spotlights and point lights won't show on big flat surfaces with few vertices, which is why the ground uses Phong.
- Adding or removing lights at runtime forces shader recompiles and causes a stutter. The car headlight is a single SpotLight that moves between cars instead.

## Performance budget

The game targets a modest PC and phones.
- Keep roughly ≤ 500 draw calls. Each chunk is 3 meshes; merge static detail into the chunk's `GB` builders rather than adding separate meshes.
- Each car is 2 meshes and each person is 5.
- Reuse shared materials and geometries instead of creating new ones.
- No new real-time lights per object. Fake glow with emissive or basic materials.
- `G` toggles shadows and pixel ratio. New expensive effects should respect that quality flag (`hq`).

## Roadmap (suggested order, confirm with the owner before starting each)

1. **Project structure (done, first pass):** `index.html` holds only the markup. Styles are in `css/style.css`, and the code is split into plain `<script>` files in `js/` (`util`, `renderer`, `textures`, `geometry`, `world`, `collision`, `cars`, `people`, `player`, `daynight`, `camera`, `input`, `hud`, `main`). They share one global scope, so the order of the script tags in `index.html` matters, and the game still opens straight from `file://`. *Later, if the code gets hard to manage:* move to ES modules with Vite and Three.js from npm, keep behaviour identical, then verify with screenshots.
2. **World variety:** districts with their own look (downtown towers, low-rise residential with houses and yards, an industrial area, a beach/waterfront edge), hand-built landmark blocks, a few more facade textures.
3. **Driving feel:** better car physics (drift, suspension bounce, proper wheels that spin and steer), engine and tyre sounds, a camera that feels good at speed, different car types.
4. **A living city:** traffic lights at junctions, pedestrians who cross at crosswalks and react to the player, and denser crowds downtown.
5. **Visual polish:** bloom at night, better shadows, ambient occlusion feel, rain and weather, distant city skyline beyond the stream radius, simple LOD for far buildings.
6. **Persistence:** save the player's position, the time of day and their car between sessions.
7. *Later:* missions, story and characters.
