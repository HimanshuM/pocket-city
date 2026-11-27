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
- Controls: WASD/arrows to move or drive, mouse to look (click to lock the pointer), Shift to run, Space to jump or handbrake, E to enter/exit a car, hold T to fast-forward time, G to toggle graphics quality, H for help, M to mute. On touch screens there's a left joystick, right-side drag to look, and Car/Run buttons.

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
- **Districts:** `districtAt(cx, cz)` returns `downtown`, `city`, `residential` or `industrial`. Downtown is a fixed circle around the spawn; elsewhere the map is split into irregular regions of about 4 × 4 blocks (nearest random centre point), and industrial is kept at least 5 blocks from the centre. `makeChunk` picks the generator from it (`city`, `residential`, `industrial`, or sometimes `park`), and the minimap colours blocks by type.
- **Coast (`js/coast.js`):** block row `COAST_CZ = 4` is the shore and every row south of it is sea, so the city is endless except to the south. The road along the shore row's north edge (z = 320) is the seaside road. Shore blocks are `beach` or `promenade` (`shoreType(cx)`, in pairs of blocks) and span the full 80 m width, covering the road stubs between them. Sea level is y = −0.8: the water is one big plane that follows the player, and the city's ground plane is clipped away south of `COAST_Z`. `groundY` asks `coastY` there, so beaches slope into the water and you can wade out to the buoy line. Promenades have a solid railing, and rocks separate a beach from a neighbouring promenade. Traffic never takes a road south of the seaside road, and pedestrians don't spawn on shore blocks (`ch.peds`).
- **Cars inside a block** (e.g. on a driveway): create them in the generator with `makeCar` + `placeCar` (world coordinates, `k.ox + lx`) and push them to `k.cars`. They become the chunk's parked cars, so they can be driven and are removed when the chunk unloads.
- **Hand-built blocks:** `CUSTOM['cx,cz'] = k => { ... }` overrides the generator for that chunk. `'0,0'` is the town square where the player spawns. This is the main way to add designed landmarks. Landmarks live in `js/landmarks.js`: Pocket Tower `'1,-1'` (tallest building, red light on the spire), City Hall `'-1,0'` (faces the square), Stadium `'3,-2'` (walk or drive in through the end entrances).

**Building geometry:** `k.B` (buildings, facade texture), `k.P` (props, vertex colors only) and `k.G` (things that glow at night) are `GB` builders. Each becomes one mesh per chunk.
- `GB.box(x, yBottom, z, sx, sy, sz, color, wall)`: **y is the bottom**, not the centre. Bottom faces are skipped.
- `k.G` boxes use their own colour as a tint on the night glow: white for normal lamps, other colours for coloured lights (e.g. the tower's red warning light).
- `GB.roof(x, yBottom, z, sx, sy, sz, color, alongX, gableColor)`: a sloped gable roof (triangular prism), ridge along x if `alongX`, else along z. `GB.quad` adds a single face.
- With `wall` set, the faces get facade UVs. `wall` is `true` (classic) or a style name from `FACADES` in `js/textures.js`: `'classic'`, `'glass'`, `'brick'`, `'ribbon'`, `'deco'`, `'house'`. Every tile is 4 × 4 window bays; one bay is 4 m wide × 3.5 m tall, so a floor is 3.5 m.
- All styles live in one **facade atlas** image (4 × 2 tiles, 2 slots free) plus a matching night-window image, so a chunk still has a single building mesh whatever styles it uses. The style travels in the UV as `u + style × 64`, and a small shader patch on `facadeMat` (`onBeforeCompile`) turns it into the right tile. To add a style: add a name to `FACADES` and a painter in `makeFacade`. Keep walls light-coloured in the painter, because the building colour tints them.

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
- **Car body springs** (player's car): the car object follows the ground and `rig` (the body) lags on springs. `sy/svy` is the vertical bounce and `pa/pw` the nose pitch from acceleration. `wsteer` is the front-wheel angle (player: from steering; traffic: from how fast it's turning).
- **Drift** (player's car, `drive()`): `c.v` is forward speed and `c.vl` sideways speed (+ = right). Turning keeps momentum, so sideways speed appears, and tyre grip removes it: high normally, lower at high speed, very low with the handbrake. Hitting things uses the full velocity: bounce on a hard hit, slide along on a scrape. Tyre marks (`layTyreMarks`) are one instanced mesh of the latest 600 strips, laid 0.14 m above `groundY` so they sit on lawns, plazas and the pitch.
- **Sound** (`js/audio.js`): everything is made with the Web Audio API, with no audio files. The engine is a soft custom wave (a few harmonics, not a sawtooth or square, which sounded harsh in earphones) plus a sine sub, through a gentle low-pass filter (no resonance, under ~1 kHz). Fake gears (`GEARS`) set the revs. Everything goes through a compressor that limits peaks. The tyre screech is band-passed noise that rises with `c.vl`. `carThud(s)` plays crashes and car doors. The `AudioContext` starts on the first click or key press (`initAudio`), because browsers block sound before that. Mute is saved in `localStorage`. Headless tests can't hear, so check levels with an `AnalyserNode` on `master`.
- A car the player leaves becomes a "free" car (teal dots on the minimap). Free cars are removed when more than 460 m away.

**Materials:**
- Most things use `MeshLambertMaterial`, which lights **per vertex**. Spotlights and point lights won't show on big flat surfaces with few vertices, which is why the ground uses Phong.
- Adding or removing lights at runtime forces shader recompiles and causes a stutter. The car headlight is a single SpotLight that moves between cars instead.

## Performance budget

The game targets a modest PC and phones.
- Keep roughly ≤ 500 draw calls. Each chunk is 3 meshes; merge static detail into the chunk's `GB` builders rather than adding separate meshes.
- Each car is 2 meshes (body, lights) and each person is 5. All wheels in the city are one `InstancedMesh` (`wheels` in `js/cars.js`, placed each frame by `updateWheels`), so wheels cost 1 draw call in total. Use instancing like this for anything that repeats on every car or person.
- Reuse shared materials and geometries instead of creating new ones.
- No new real-time lights per object. Fake glow with emissive or basic materials.
- `G` toggles shadows and pixel ratio. New expensive effects should respect that quality flag (`hq`).

## Roadmap (suggested order, confirm with the owner before starting each)

1. **Project structure (done, first pass):** `index.html` holds only the markup. Styles are in `css/style.css`, and the code is split into plain `<script>` files in `js/` (`util`, `renderer`, `textures`, `geometry`, `world`, `landmarks`, `coast`, `collision`, `cars`, `people`, `player`, `daynight`, `camera`, `input`, `hud`, `audio`, `main`). They share one global scope, so the order of the script tags in `index.html` matters, and the game still opens straight from `file://`. *Later, if the code gets hard to manage:* move to ES modules with Vite and Three.js from npm, keep behaviour identical, then verify with screenshots.
2. **World variety:** districts with their own look (downtown towers, low-rise residential with houses and yards, an industrial area, a beach/waterfront edge), hand-built landmark blocks, a few more facade textures. *Done so far:* districts, residential blocks (houses with roofs, lawns, fences, driveways, a shared garden with a pool) and industrial blocks (fenced yard, warehouse with office, containers, silos, chimney). Landmarks: Pocket Tower, City Hall, Stadium. Coastline: beaches and a lit promenade along the seaside road, 4 blocks south of the spawn. Facade styles: glass, brick, ribbon windows, art deco and house siding (city towers are mostly glass/deco; shorter buildings mix brick, classic, ribbon and deco).
3. **Driving feel:** better car physics (drift, suspension bounce, proper wheels that spin and steer), engine and tyre sounds, a camera that feels good at speed, different car types.
4. **A living city:** traffic lights at junctions, pedestrians who cross at crosswalks and react to the player, and denser crowds downtown.
5. **Visual polish:** bloom at night, better shadows, ambient occlusion feel, rain and weather, distant city skyline beyond the stream radius, simple LOD for far buildings.
6. **Persistence:** save the player's position, the time of day and their car between sessions.
7. *Later:* missions, story and characters.
