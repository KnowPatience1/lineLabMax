I think this is one of the most important design decisions we’ve made so far.
In fact, what you’ve just said makes me realize that width generation and color generation are really the same problem.

The key sentence is:
“The line width is generated ‘at birth’.”
That fits perfectly with the philosophy you’ve described from the beginning.

A Line has intrinsic properties
When a Line comes into existence, it receives intrinsic values:

* start
* end
* color
* width

These become part of the immutable line definition.
After that, they are no longer “generated”; they simply exist.
That matches what we decided earlier about color.
⸻
A Group is a generator
A Group does not contain line colours or line widths.
Instead it contains the rules for generating them.

For example:
Group
color_min
color_max
width_min
width_max

When a new line is created inside the group, the group might do something conceptually like:
color = random value between color_min and color_max
width = random value between width_min and width_max

Those generated values are written into the new Line.
The line then owns them forever (unless changed later by an Action).
⸻
Actions

Later an Action might say:
“Ignore the intrinsic width.”
and compute a new one.

For example:
Action
    width_source = action
    width_min = 0.01
    width_max = 0.05
    sort by x
    assign widths

The Action doesn’t alter the original width stored in the line.
It changes the current working width used for rendering.
That’s completely consistent with the architecture we’ve been building.
⸻
I think we’ve discovered a general principle
I would write it into the specification.

Intrinsic attributes stored permanently in the Line.
start
end
color
width

These are generated once when the line is created.
⸻
Generators

Stored in Group (and perhaps elsewhere later).
color_min
color_max
width_min
width_max

These describe how new intrinsic values are generated.
⸻
Actions

Actions never create a new line.
They derive temporary values from the intrinsic ones.

For example:
* recolour
* resize width
* filter
* sort
* transform
⸻
This has another nice consequence:

Remember your idea that sorting should never destroy the original order?
The same philosophy now appears everywhere:
* The original geometry remains.
* The original colour remains.
* The original width remains.

Everything that happens afterwards is an Action operating on those immutable originals.
I think that’s a remarkably coherent model. It means the entire LineLab system revolves around a single principle:
Generate once. Transform many times.

When you first described your artistic process months ago—starting with a random field of lines and then progressively shaping it—that principle was already there. It’s satisfying to see the software architecture naturally reflecting the way you actually create your artwork. I think that’s a strong indication that we’re building the right abstraction rather than forcing the project into an arbitrary software design.

The width_min and width_max should be set when constructing the group.
_________

You said:

“I want to have sensible default values when the group is constructed.”

That suggests an important design principle:

A newly constructed object should always be immediately useful.

I think we should adopt that as a rule for the whole project.

* A new Line should already be drawable.
* A new Group should already be able to generate lines.
* A new Layer should already be usable.
* A new Project should already be valid.
