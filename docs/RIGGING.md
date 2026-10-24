# Avatar Rigging Guide

## What's in place now (automated, 2026-10-24)

`public/models/EfraimBaruh-rigged.glb` is produced by a headless, scripted
Blender pipeline. Re-run it whenever the rig, the pose or the idle changes:

```bash
# 0. Decode the source scan for Blender (kept out of public/).
npx @gltf-transform/cli@4 copy assets/source/EfraimBaruh-scan.glb /tmp/avatar-raw.glb
npx @gltf-transform/cli@4 dequantize /tmp/avatar-raw.glb /tmp/avatar-edit.glb
# 1. Rig, relax the A-pose, add Idle, export (optional preview renders).
blender -b --factory-startup -P scripts/avatar/rig_avatar.py -- /tmp/avatar-edit.glb /tmp/avatar-rigged.glb /tmp/preview
# 2. Compress for the web.
npx @gltf-transform/cli@4 optimize /tmp/avatar-rigged.glb public/models/EfraimBaruh-rigged.glb \
  --compress meshopt --texture-compress webp --texture-size 2048 --simplify false
```

How it works (details in the script's docstring):
- **22-bone skeleton** with Mixamo-style names (`Hips` … `Head`,
  `LeftArm`, …), placed from slices measured through the scan.
- **Volumetric weights.** The scan has 282 islands and open edges, so
  bone-heat weighting is unreliable. Each bone is a tapered capsule with a
  thickness, plus a reach cutoff so torso bones can't leak into the hands.
  Verified: 0 edges stretch more than 2.5× in the relaxed pose.
- **The relaxed pose is the rest pose** (arms down, slight elbow bend). The
  web default is the relaxed stance, and the point-cloud intro samples the
  correct surface.
- **`Idle`**: a 4 s seamless loop of breathing and weight shift. **Head
  tracking** is code (`src/components/scene/useHostBehavior.ts`): the neck
  takes 40% and the head 60% of the turn, clamped. Head turns are verified
  clean to about 28° combined.
- Result: 3.1 MB, 1 skin, 22 joints, the same extensions as before.

Tweak the pose or idle through the constants at the top of
`scripts/avatar/rig_avatar.py` (`ARM_DROP`, `ELBOW_BEND`, the `motion` table).

Known limits: there are no finger bones, and the `Neck` bone owns no
vertices (neck skin follows `Head`/`Spine2`), which is fine for look-at.
Bigger gestures (wave, point) need either Mixamo clips (Track B below) or
hand-keyed actions added to the script.

---

## Manual alternatives

Goal: turn the static 3D scan (`public/models/EfraimBaruh-compressed.glb`, a
T-pose with no skeleton) into a web-ready host with a relaxed pose and a few
animation clips, without blowing the size budget (target under ~4 MB).

There are two tracks. **Track A** removes the T-pose in an afternoon with no
code changes. **Track B** is the full host (idle, head tracking, gestures).
Track A's posing work carries over into Track B.

---

## 0. Get an editable source

The web GLB is meshopt-compressed and quantized, which Blender can't import
directly. Use the original scan if you have it (best quality). Otherwise,
decode the web file. These steps were verified on this exact file with
`@gltf-transform/cli@4` (requires Node ≥ 20.12; the repo pins Node 24):

```bash
# 1. Decode meshopt (3.1 MB → 3.7 MB)
npx @gltf-transform/cli@4 copy assets/source/EfraimBaruh-scan.glb /tmp/avatar-raw.glb
# 2. Remove quantization so Blender imports plain floats (→ 4.4 MB)
npx @gltf-transform/cli@4 dequantize /tmp/avatar-raw.glb /tmp/avatar-edit.glb
```

Import into **Blender 4.x**: File → Import → glTF 2.0.

Clean up:
- Apply all transforms (Ctrl+A → All Transforms). Feet at the origin, facing −Y.
- Merge the 7 primitives into one mesh object if the rig tool wants a single
  mesh. Keep the materials.
- Optional: decimate the body (not the face) if you want headroom. The face
  is about 40k triangles, the body about 28k.

## Track A: pose only (no skeleton on the web)

1. Auto-rig the mesh (step B1 below), or add a basic Rigify metarig.
2. Pose: arms down and relaxed, slight elbow bend, weight on one leg, head
   tilted about 3° toward camera-left. That's a good portrait stance for the hero.
3. Apply the pose: select the mesh → Armature modifier → **Apply**. Then
   delete the armature.
4. Export a GLB (step B4) and compress it (step B5). Replace the file in
   `public/models/`.

The intro, reveal shader, and framing work unchanged, because the code
samples whatever static mesh it gets.

## Track B: full host

### B1. Auto-rig
Pick one:
- **Mixamo** (free, fastest): export the mesh as FBX from Blender (Path Mode:
  Copy, Embed Textures). Upload to mixamo.com and place the markers (chin,
  wrists, elbows, knees, groin). Download as **FBX Binary, With Skin, T-pose**.
- **AccuRig** (free, ActorCore): better hand and finger weights, and it
  exports FBX.
- **Blender Rigify**: the most control, but the most manual work.

### B2. Clips (keep each short, 2–6 s, looping)

| Clip | Use on site | Source |
|---|---|---|
| `Idle` | breathing and weight shift, always on | Mixamo "Breathing Idle" |
| `Greet` | small wave or nod after the intro | Mixamo "Waving" (trim) |
| `Point` | turning or gesturing toward content | Mixamo "Pointing" (trim) |
| `Listen` | Contact page | Mixamo "Standing Idle 2" |

Download each clip **Without Skin** to keep files small. In Blender, import
the rigged FBX plus the clip FBXs, then move each action onto the main
armature with the Action Editor and name it as in the table.

Head tracking is *not* a clip. The code rotates the `Head` and `Neck` bones
toward the cursor, clamped and damped, on top of `Idle`. Keep standard bone
names (`mixamorig:Head`, `mixamorig:Neck`).

### B3. Checks in Blender
- Scale: 1 unit = 1 m, height about 1.8.
- Weight-paint the jacket around the shoulders and the tie. Scans deform
  poorly there.
- Root motion: none. The avatar stays in place.
- Bake the clips to the deform bones only. Delete the control bones before
  export.

### B4. Export
File → Export → glTF 2.0 (.glb):
- Include: selected objects, **Skinning**, **Animation** (all actions, NLA off,
  "Group by NLA track" off)
- Mesh: apply modifiers, UVs, normals. Leave tangents off (the scan has no
  normal maps).
- Shape keys: off unless you add facial expressions later.

### B5. Compress for the web
```bash
npx @gltf-transform/cli@4 optimize avatar-rigged.glb public/models/EfraimBaruh-rigged.glb \
  --compress meshopt --texture-compress webp --texture-size 2048
```
Then check the result:
```bash
npx @gltf-transform/cli@4 inspect public/models/EfraimBaruh-rigged.glb
```
Expect: 1 skin, about 65 joints (Mixamo), 4 animations, under ~4 MB.
(Reference: the static scan round-trips through these exact steps to 3.0 MB
with the same extensions the site loads today.)

### B6. Hand-off to code
Tell Claude the file is in place. The integration is:
- `useGLTF` + `useAnimations` (drei), with `Idle` always playing and
  crossfades to `Greet` and `Point`
- Head and neck look-at in `useFrame` after the mixer update
- The surface sampler must use skinned positions (`SkinnedMesh` +
  `boneTransform`), or sample the bind pose before animations start
- Keep the static GLB as the fallback for reduced motion and low-end devices
