# Knowledge Extract — Portfolio v1 (deprecated)

Everything worth keeping from the first implementation (CRA + React 19 + Three.js,
last commit `f0bde1f`, 2026-09-20). v1 is being rebuilt from scratch because its
UI/UX and visual design were weak. **Content and assets carry over; code and styling
do not.**

> Facts below were copied from v1 source. Some conflict with each other — see
> [Inconsistencies to resolve](#inconsistencies-to-resolve) before publishing anything.

---

## 1. Person

| Field | Value (as found in v1) |
|---|---|
| Name | Efraim Baruh Bölükbaşı (v1 wrote it without diacritics: "Bolukbasi") |
| Title | Senior Software Engineer — Unity, C#/.NET, AR/VR, mobile games |
| Current role | Senior Software Engineer (Remote) at **Rapsodo**, Singapore — MiniApp SDK and the `SuperApp` golf application (device communication layers, SIL simulation workflows) |
| Location | Vasastaden, Stockholm, Sweden |
| Has lived/worked in | Turkey, the UK, Sweden |
| Languages (Social page) | Turkish, English, Russian, Chinese |
| Email (v1 Contact page) | efraimbaruh.bolukbasi@yahoo.com |
| LinkedIn | https://linkedin.com/in/efraimbaruh-bolukbasi |
| GitHub | https://github.com/EfraimBaruh |

### Skills (v1 About page)
- Unity 3D, 5+ years — UWP, WebGL, Android, iOS
- Mobile application development, 2+ years
- Machine vision (C++)
- C#/.NET, real-time simulation, physics, shaders, networking
- Version control: Bitbucket, GitLab · PM: Jira, Slack, MS Teams

## 2. Career timeline

| Company | Role | Period | Focus |
|---|---|---|---|
| **Rapsodo** (Singapore, remote) | Senior Unity Developer → Senior Software Engineer | 2023 – present | Golf simulation, golf mini-games, MiniApp SDK, SuperApp, device comms, SIL simulation |
| **Gleechi AB** (Sweden) | Senior VR Developer | ? | VR industrial training simulations (hand interaction) |
| **Leke Games** (Turkey) | Developer | ? | Multiplayer mobile games — *TDZ: Traffic Driving Zone*, *Defense of the Kings* |
| **ADASTEC** (Turkey) | Developer | ? | Unity + ROS2 simulation for Level 4 autonomous vehicles |
| **VRLabAcademy** | VR Developer | 2020 – 2022 | VR university physics/chemistry lab experiments |
| **Scalar Vision** | AR/VR Developer | 2019 – 2020 | 3D holographic communication, 3D scanning |

Gaps marked `?` need dates from the résumé.

## 3. Project case studies (from `src/data/projects.js`)

### Golf Simulation — Rapsodo (2023 – present)
- Immersive golf simulation in Unity with realistic physics and course environments.
- Tech: Unity, C#, 3D modeling, physics
- Video: https://www.youtube.com/embed/yKx0g9ECHBI
- Led real-time physics simulation for golf ball trajectory; 3D modeling/texturing
  of courses; mobile performance optimization; UI work with the design team.

### VR Lab Experiments — VRLabAcademy (2020 – 2022)
- VR simulations of university-level lab experiments that make science education
  more accessible.
- Tech: VR, Unity, education, interactive learning
- Video: https://www.youtube.com/embed/4ju-EpsM97Q
- Interactive VR lab environments; physics simulation of chemical reactions;
  assessment and feedback systems; worked with educators on accuracy.

### 3D Holographic Communication — Scalar Vision (2019 – 2020)
- Real-time 3D holographic communication across distances.
- Tech: AR/VR, Unity, 3D scanning, real-time networking
- Video: https://www.youtube.com/embed/KpMGg58Wa2U
- Real-time 3D scanning/reconstruction; multi-user network sync; custom hologram
  shaders; low-latency streaming optimization.
- **Narrative hook:** the 3D-scanned avatar on the new site ties directly to this
  work, since Efraim built 3D scanning and holographic tech.

### Candidates for new case studies (no v1 card yet)
- Gleechi: VR industrial training
- Leke Games: *TDZ: Traffic Driving Zone*, *Defense of the Kings*
- ADASTEC: Unity + ROS2 autonomous-vehicle simulation
- Rapsodo: MiniApp SDK / SuperApp architecture (engineering-depth story)

## 4. Blog posts (v1 drafts, both dated March 15, 2024)
1. **NPM Package Management for Unity (UPM) with Verdaccio**: a private Verdaccio
   registry, `scopedRegistries` in `manifest.json`, semver, CI publishing.
2. **Scriptable Objects and Events in Unity**: a `GameEvent` ScriptableObject plus a
   `GameEventListener` MonoBehaviour, decoupling, best practices.

Both are short and could be revived as MDX posts.

## 5. Assets inventory

### 3D models (`public/models/`)

**`EfraimBaruh-compressed.glb`: Efraim's 3D-scan avatar (3.1 MB) ★ primary asset**
- Generator: glTF-Transform v3.10.1
- Required extensions: `EXT_meshopt_compression`, `KHR_mesh_quantization`,
  `EXT_texture_webp` (also `KHR_materials_specular`)
- Loading needs `MeshoptDecoder`, and you must await `MeshoptDecoder.ready` *before*
  `loader.setMeshoptDecoder` and parsing. v1 hit a bug because it didn't.
- 1 node (`Object_8`), 1 mesh with **7 primitives**, about 68k triangles total;
  the largest primitive (~40.7k tris, top of the Y range) is the head/face
- 7 materials (`Material.001`–`.006`, `Material_0`), 17 WebP textures
- Attributes: POSITION, NORMAL, TEXCOORD_0; **no tangents**
- **No skin, no bones, no animations.** It's a static scan. For it to act as a
  "host" (idle breathing, head tracking the cursor, gestures) it has to be
  **rigged** first (Mixamo auto-rig, AccuRig, or Blender + Rigify), then
  re-exported and re-compressed. Until then, motion is limited to whole-body
  transforms, shaders, and camera moves.
- v1 placement: position `[2.0, -2.1, 4.8]`, scale `1.5`, rotation Y `-π/3`,
  rendered as a cyan, flickering, semi-transparent hologram

**`R2D2-compressed.glb`: R2-D2 (1.2 MB)**
- "Star Wars R2-D2" by tegnemaskin, Sketchfab, **CC-BY-4.0** (attribution needed)
- v1 used it as the hologram "emitter"
- **Recommendation: drop it.** It's third-party IP, and it doesn't fit a sleek,
  personal brand.

**`scene.bin` (2.3 MB) + `license.txt`: orphaned**
- Leftover buffer from the Sketchfab model *R.E.P.O "Realistic" Character* by
  Tijmen Zwaneveld (CC-BY-4.0). There's no matching `.gltf`, and nothing references
  it. **Delete it.**

### Images (`src/assets/images/`)
| File | Size | Notes |
|---|---|---|
| `rapsodo-logo.png` | 200×200 | keep; replace with SVG if possible |
| `scalar-vision-logo.png` | 200×200 | keep |
| `vr-lab-logo.png` | 200×200 | keep |
| `home.png` | 1024×1024 | AI-rendered dark loft interior; old hero background, unused. Drop it. |
| `wanted_2.png` | 1024×1536 | unrelated joke "WANTED" poster, unused. **Do not carry over.** |

## 6. Lessons from v1 (what not to repeat)
- Look shifted from burgundy, to cyan-hologram, to a "dark terminal" look, with no
  consistent system. Commit to one design system up front.
- The 3D layer was decoration, not a feature: a fixed full-window canvas with
  hard-coded transforms, a 75° FOV, no loading state, no fallback, and no
  reduced-motion handling.
- Imperative Three.js inside `useEffect` was hard to compose. A declarative layer
  (React Three Fiber) or a well-isolated scene class works better.
- Placeholder content went live: Social cards point to images that don't exist,
  and project `image` fields name missing files.
- Blog posts were HTML strings rendered with `dangerouslySetInnerHTML`. Use MDX.
- Contact used `window.confirm` before `mailto:`. Use a direct link or a real form.

## Inconsistencies to resolve
1. **Title:** "Unity Developer | AR & VR Specialist" (Home), "Senior Unity
   Developer" (projects data), or "Senior Software Engineer" (résumé/CLAUDE.md)?
2. **Email:** yahoo address on the site vs. `efraimbaruhbolukbasi@gmail.com` on the
   git account. Which one is public?
3. **Location:** Stockholm on the Contact page, remote for Rapsodo Singapore.
   Confirm how to present it.
4. **Dates** for Gleechi, Leke Games, ADASTEC.
5. The v1 About page says Rapsodo work is "golf-based mini-games", while the
   résumé says MiniApp SDK / SuperApp. Present both?
