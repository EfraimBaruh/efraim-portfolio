"""Rig Efraim's 3D scan, relax the A-pose, add an idle loop, export a GLB.

Headless and reproducible:
    blender -b --factory-startup -P scripts/avatar/rig_avatar.py -- <edit.glb> <out.glb> [preview_prefix]

`edit.glb` is the web GLB decoded for Blender (see docs/RIGGING.md, step 0).

Approach
- Joint positions come from slices through the scan geometry (measured once,
  see JOINTS). The scan faces -Y; +X is the character's left.
- The scan has ~280 disconnected islands and open edges, so Blender's
  bone-heat weighting is unreliable. Weights are volumetric instead: each
  bone is a tapered capsule with a thickness, and a vertex binds by its
  distance *relative to that thickness*. Thin limbs therefore only claim
  the sleeve/trouser around them, not the jacket next to them.
- The relaxed pose becomes the rest pose, so the web default is the
  relaxed stance and animations are small offsets from it. The point-cloud
  intro samples the bind pose, which then matches what is displayed.
"""
import math
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

# name: (head, tail, parent, radius_head, radius_tail). Metres, Blender Z-up.
JOINTS = {
    "Hips": ((0, 0.0, 0.93), (0, 0.0, 1.05), None, 0.20, 0.20),
    "Spine": ((0, 0.0, 1.05), (0, 0.005, 1.18), "Hips", 0.20, 0.20),
    "Spine1": ((0, 0.005, 1.18), (0, 0.01, 1.32), "Spine", 0.20, 0.21),
    "Spine2": ((0, 0.01, 1.32), (0, 0.0, 1.53), "Spine1", 0.22, 0.09),
    "Neck": ((0, 0.0, 1.53), (0, -0.005, 1.64), "Spine2", 0.07, 0.07),
    "Head": ((0, -0.005, 1.64), (0, -0.02, 1.88), "Neck", 0.11, 0.10),
    "LeftShoulder": ((0.03, 0.02, 1.47), (0.17, 0.03, 1.46), "Spine2", 0.08, 0.08),
    "LeftArm": ((0.17, 0.03, 1.46), (0.36, 0.04, 1.235), "LeftShoulder", 0.065, 0.055),
    "LeftForeArm": ((0.36, 0.04, 1.235), (0.525, 0.0, 1.055), "LeftArm", 0.055, 0.045),
    "LeftHand": ((0.525, 0.0, 1.055), (0.645, -0.07, 0.90), "LeftForeArm", 0.07, 0.06),
    "LeftUpLeg": ((0.095, 0.0, 0.93), (0.10, -0.005, 0.50), "Hips", 0.10, 0.075),
    "LeftLeg": ((0.10, -0.005, 0.50), (0.095, 0.03, 0.09), "LeftUpLeg", 0.075, 0.06),
    "LeftFoot": ((0.095, 0.03, 0.09), (0.10, -0.10, 0.03), "LeftLeg", 0.06, 0.05),
    "LeftToeBase": ((0.10, -0.10, 0.03), (0.10, -0.20, 0.02), "LeftFoot", 0.05, 0.04),
}
# Mirror the left side to the right.
for name in [n for n in JOINTS if n.startswith("Left")]:
    (h, t, parent, rh, rt) = JOINTS[name]
    mirror = lambda p: (-p[0], p[1], p[2])
    JOINTS[name.replace("Left", "Right")] = (
        mirror(h),
        mirror(t),
        parent.replace("Left", "Right") if parent.startswith("Left") else parent,
        rh,
        rt,
    )

WEIGHT_POWER = 6  # higher = stiffer limbs, narrower blend at joints
# A bone never influences vertices beyond this many of its own radii (plus a
# small margin). Without it, the falloff lets the thick torso bones leak a
# few percent into far-away thumbs, which then stretch into spikes.
REACH_RADII = 2.2
REACH_MARGIN = 0.03
MAX_INFLUENCES = 4

# Relaxed pose, in degrees. Arms swing down in the frontal plane (about
# global Y at the shoulder), elbows bend slightly forward.
ARM_DROP = 28.0
CLAVICLE_DROP = 5.0
ELBOW_BEND = 14.0
HEAD_TILT = 2.0

FPS = 30
IDLE_SECONDS = 4


def log(*args):
    print("[rig]", *args, flush=True)


def import_scan(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if len(meshes) > 1:
        bpy.ops.object.select_all(action="DESELECT")
        for o in meshes:
            o.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        bpy.ops.object.join()
    mesh = bpy.context.view_layer.objects.active or meshes[0]
    # Bake the node transform into vertices so mesh space == world space.
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    mesh.name = "EfraimBaruh"
    return mesh


def build_armature():
    data = bpy.data.armatures.new("Skeleton")
    rig = bpy.data.objects.new("Skeleton", data)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for name, (head, tail, parent, _, _) in JOINTS.items():
        b = data.edit_bones.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
    for name, (head, _, parent, _, _) in JOINTS.items():
        if parent:
            b = data.edit_bones[name]
            b.parent = data.edit_bones[parent]
            b.use_connect = (Vector(head) - data.edit_bones[parent].tail).length < 1e-4
    # Consistent roll so local axes are predictable for code-driven bones.
    for b in data.edit_bones:
        b.align_roll(Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def volumetric_weights(mesh):
    n = len(mesh.data.vertices)
    co = np.empty(n * 3)
    mesh.data.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)

    names = list(JOINTS)
    nd = np.empty((n, len(names)))
    reach = np.empty((n, len(names)), dtype=bool)
    for j, name in enumerate(names):
        head, tail, _, rh, rt = JOINTS[name]
        a, b = np.array(head), np.array(tail)
        ab = b - a
        t = np.clip(((co - a) @ ab) / (ab @ ab), 0.0, 1.0)
        closest = a + t[:, None] * ab
        dist = np.linalg.norm(co - closest, axis=1)
        radius = rh + (rt - rh) * t
        nd[:, j] = dist / radius
        reach[:, j] = dist <= radius * REACH_RADII + REACH_MARGIN

    w = 1.0 / np.maximum(nd, 1e-3) ** WEIGHT_POWER
    # Out of reach -> no influence; but every vertex keeps its nearest bone.
    nearest = np.argmin(nd, axis=1)
    reach[np.arange(n), nearest] = True
    w[~reach] = 0.0
    # Keep the strongest influences only (GPU skinning uses 4).
    drop = np.argsort(-w, axis=1)[:, MAX_INFLUENCES:]
    np.put_along_axis(w, drop, 0.0, axis=1)
    w /= w.sum(axis=1, keepdims=True)

    for j, name in enumerate(names):
        group = mesh.vertex_groups.new(name=name)
        idx = np.nonzero(w[:, j] > 1e-4)[0]
        for i in idx:
            group.add([int(i)], float(w[i, j]), "REPLACE")
    dominant = np.array(names)[np.argmax(w, axis=1)]
    counts = {name: int((dominant == name).sum()) for name in names}
    log("dominant-bone vertex counts:", counts)


def bind(mesh, rig):
    mod = mesh.modifiers.new("Armature", "ARMATURE")
    mod.object = rig
    mesh.parent = rig


def rotate_bone_world(rig, name, axis, degrees):
    """Rotate a pose bone about a world axis through its head."""
    pb = rig.pose.bones[name]
    bpy.context.view_layer.update()
    head = rig.matrix_world @ pb.head
    r = Matrix.Rotation(math.radians(degrees), 4, Vector(axis))
    pb.matrix = (
        rig.matrix_world.inverted()
        @ Matrix.Translation(head)
        @ r
        @ Matrix.Translation(-head)
        @ rig.matrix_world
        @ pb.matrix
    )
    bpy.context.view_layer.update()


def relax_pose(rig):
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    for side, sign in (("Left", 1), ("Right", -1)):
        rotate_bone_world(rig, f"{side}Shoulder", (0, 1, 0), sign * CLAVICLE_DROP)
        rotate_bone_world(rig, f"{side}Arm", (0, 1, 0), sign * ARM_DROP)
        rotate_bone_world(rig, f"{side}ForeArm", (1, 0, 0), -ELBOW_BEND)
    rotate_bone_world(rig, "Head", (0, 1, 0), HEAD_TILT)
    bpy.ops.object.mode_set(mode="OBJECT")


def apply_pose_as_rest(mesh, rig):
    # Bake the deformation into the mesh, make the pose the new rest, rebind.
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.modifier_apply(modifier="Armature")
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    mod = mesh.modifiers.new("Armature", "ARMATURE")
    mod.object = rig


def add_idle(rig):
    """Subtle breathing and weight shift; loops seamlessly."""
    frames = FPS * IDLE_SECONDS
    action = bpy.data.actions.new("Idle")
    rig.animation_data_create()
    rig.animation_data.action = action
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = 0, frames
    bpy.context.scene.render.fps = FPS

    # bone: (local axis index, amplitude deg, phase offset in cycles)
    motion = {
        "Hips": [(1, 0.6, 0.0)],
        "Spine1": [(0, -1.2, 0.0)],
        "Spine2": [(0, -0.9, 0.05)],
        "Neck": [(0, 0.6, 0.1)],
        "Head": [(0, 0.5, 0.15), (1, 0.4, 0.4)],
        "LeftArm": [(2, 0.8, 0.05)],
        "RightArm": [(2, -0.8, 0.05)],
    }
    for name, channels in motion.items():
        pb = rig.pose.bones[name]
        pb.rotation_mode = "XYZ"
        for f in range(0, frames + 1, 5):
            phase = f / frames
            rot = [0.0, 0.0, 0.0]
            for axis, amp, offset in channels:
                rot[axis] = math.radians(amp) * math.sin(2 * math.pi * (phase + offset))
            pb.rotation_euler = rot
            pb.keyframe_insert("rotation_euler", frame=f)
    log("idle action:", action.name, frames, "frames")


def export(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_skins=True,
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_yup=True,
        export_apply=False,
        export_image_format="AUTO",
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
    )
    log("exported", path)


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :]
    src, out = argv[0], argv[1]
    preview = argv[2] if len(argv) > 2 else None

    mesh = import_scan(src)
    rig = build_armature()
    volumetric_weights(mesh)
    bind(mesh, rig)
    relax_pose(rig)
    apply_pose_as_rest(mesh, rig)
    add_idle(rig)

    if preview:
        sys.path.insert(0, __file__.rsplit("/", 1)[0])
        import preview as pv

        bpy.context.scene.frame_set(0)
        pv.setup_render()
        pv.render_views(preview)

    export(out)


main()
