Let the reshuffling of the index first of all be random. We can use some kind of algorithm later. I need to be able to sort the attributes after they are assigned. We are always starting from the immutable set of numbers and playing with a temporary set of the same numbers in a different order.

I don't understand the reason for set_poolId(), when the poolId is named automatically in save_randomPool()
Great question. In your current flow, you usually do not need `set_poolId` because `save_randomPool` and `load_randomPool` already set it automatically.

Why `set_poolId` still exists:
1. Manual recovery/override:
If state is reset (for example after `generate`, which clears `currentPoolId`), you can reattach view operations to a known pool ID without reloading that pool file.
2. External workflow support:
If you are working with externally managed files/index data, you can force the active `pool_id` context for commands like `save_view`, `load_view`, and `list_views_for_pool`.
3. Debug/testing convenience:
It lets you simulate different pool contexts quickly in Max while testing.

Where this happens in code:
- Auto-set on save: lineBaseSystem.js
- Auto-set on load: lineBaseSystem.js
- Manual set command: lineBaseSystem.js
- Cleared on new generate: lineBaseSystem.js

If you prefer stricter behavior, we can remove `set_poolId` and enforce pool context only from save/load operations.

The co-ordinates are originally all numbers between 0 and 1. In order to be used in a form (sphere, cube), they must be massaged into the number space of that form. For example, a cube requires co-ordinates between -1 and +1.They are at this point already no longer part of the original set of random numbers: they are part of the View definition.
(Cage used very few random numbers in comparison.)
Are there parallels, in this way of working, to evolution? The way the original rands are immutable, as a basis for the processes which continue on top? Or should I be thinking that the rands are also changing when they become too burdensome?

Q: Where do I find the total number of lines that have been generated?

A: Use the architecture message.
In lineBaseSystem.js:1597, the code emits:
architecture layerCount groupCount lineCount
The 3rd numeric value is the total number of lines.
You can also get the same total from:
reportHierarchy begin message in lineBaseSystem.js:2647:
hierarchy_begin layerCount groupCount lineCount
Render pass count in lineBaseSystem.js:1589:
rendered lines.length
If you want a single reliable query point, use architecture.

Q: Is it possible in SVG files to state the order of rendering and technique of blending lines?

A: Yes. SVG gives you quite a lot of control over both drawing order and how objects blend. It’s actually a better format than many people realize for line-based art....

One thing struck me while reading your question.

Your artwork is fundamentally about lines.

Blender converts those lines into meshes before rendering them. SVG keeps them as lines.

That has several advantages:

* files are tiny
* infinitely scalable
* editable in Illustrator or Inkscape
* ideal for printing
* preserves the underlying geometry

Given the way you’ve described your artistic interests—relationships between lines, endpoints, ordering, and layering—I think SVG deserves to be one of LineLab’s first renderers, alongside Max.

I could even imagine this set of renderers:

* Max renderer — interactive exploration and animation.
* SVG renderer — publication-quality vector output.
* Blender renderer — photorealistic or stylized high-resolution rendering.

Those three together would cover a remarkably wide range of uses while sharing the same LineLab geometry engine.

Q: But my lines are in 3-D space, they go over and under other lines.
A: That changes things significantly.

Once your lines exist in 3D space, SVG is no longer a complete representation of the artwork. Before you can draw them in SVG, you have to project them onto a 2D plane.

The question then becomes: what should happen when two lines cross in the projection?

There are several possibilities.

Option 1: Painter’s algorithm

Project all the lines to 2D, compute a depth value (for example, the average z-value), sort them from back to front, and draw them in that order.

This is simple and often produces convincing results.

Option 2: True visibility

Split lines wherever they intersect in depth and draw only the visible portions.

This is much harder, but it produces technically correct hidden-line removal.

CAD systems do this routinely.

Option 3: Ignore depth

Simply draw in whatever order the View specifies.

Many abstract artists do exactly this because the ambiguity is aesthetically interesting.

Option 4: Hybrid

This is the one that immediately came to mind for LineLab.

Since you already have a View, why not make render order an explicit artistic parameter rather than something imposed by the renderer?

For example, a view might specify:

render_order = depth

or

render_order = random

or

render_order = by_group

or

render_order = user_defined

The renderer would then follow that instruction.

⸻

Blender vs SVG

This also highlights an important difference.

Blender’s renderer uses a z-buffer. It determines visibility per pixel, so if one line passes behind another, the hidden part disappears automatically.

SVG has no concept of a z-buffer. It only knows the order in which objects are painted.

⸻

A thought about LineLab

Over the past few months we’ve been treating the renderer as something that shows the geometry. I’m beginning to think that visibility itself might be part of the artwork.

Imagine a renderer pipeline like this:

3D Geometry
      ↓
Camera
      ↓
Projection
      ↓
Visibility Strategy
      ↓
Render Order
      ↓
Renderer

Here, “Visibility Strategy” could be:

* z-buffer (Blender)
* painter’s algorithm (SVG)
* no occlusion
* hidden-line removal
* x-ray (everything visible with transparency)
* custom artistic rule

That would let the same LineLab project produce very different visual results simply by changing the visibility strategy, without altering the underlying geometry.

Given your work with thousands of intersecting lines, I think that separation could become one of LineLab’s strengths. Visibility and occlusion don’t have to be fixed properties of the renderer—they can become creative parameters in their own right.
