"""Render front/side/three-quarter previews of a GLB (or the current scene).

Usage: blender -b --factory-startup -P preview.py -- <in.glb> <out_prefix>
"""
import bpy, math, sys
from mathutils import Vector


def setup_render(res=(640, 900)):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "TEXTURE"
    scene.display.shading.show_cavity = False
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.film_transparent = False
    scene.world = scene.world or bpy.data.worlds.new("World")
    scene.display.shading.background_type = "VIEWPORT"
    scene.display.shading.background_color = (0.15, 0.15, 0.14)


def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == "MESH" for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def render_views(prefix, views=(("front", 0), ("side", 90), ("three_quarter", 35))):
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    mn, mx = bounds(meshes)
    center = (mn + mx) / 2
    height = mx.z - mn.z
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = height * 1.12
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    for name, deg in views:
        a = math.radians(deg)
        # Character faces -Y; orbit around Z.
        cam.location = center + Vector((math.sin(a) * 6, -math.cos(a) * 6, 0))
        cam.rotation_euler = (math.radians(90), 0, a)
        bpy.context.scene.render.filepath = f"{prefix}_{name}.png"
        bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1 :]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=argv[0])
    setup_render()
    render_views(argv[1])
