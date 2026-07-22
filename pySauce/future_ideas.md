One more thought:

I think we should distinguish between two kinds of “defaults”:

1. Technical defaults – values needed so an object is valid.
2. Artistic defaults – values that influence the look of the generated artwork.

Your width range is in the second category. It’s part of the artistic behavior of LineLab, not just a programming convenience.

That makes me think that, eventually, these defaults should probably belong to the Project rather than being global constants. **A LineLab project could then embody a particular visual “style” from the moment it’s created.**

We don’t need to solve that today, but I think it’s worth keeping in mind because it aligns very well with your vision of LineLab as a creative tool rather than just a graphics library.
______________

3. One design suggestion (not a bug)

I actually like the way you’ve written:

default_factory=lambda: Color(
    DEFAULT_COLOR_MIN.r,
    DEFAULT_COLOR_MIN.g,
    DEFAULT_COLOR_MIN.b,
    DEFAULT_COLOR_MIN.a,
)

It’s correct.

However, since we control the Color class, I think we can make this cleaner in the future by giving Color a copy method:

def copy(self):
    return Color(self.r, self.g, self.b, self.a)

Then Group could simply write:

default_factory=lambda: DEFAULT_COLOR_MIN.copy()

That’s not something I’d do today. It’s just an observation that our own classes can provide convenience methods when we find ourselves repeating code.
__________
Actions become transient objects used by the user interface.
Views are persistent.
__________
Using the same set of coordinates, I can produce different structures by changing only the relationships between them.
__________
Attribute       Group   Layer   Project
translation     y       y       y
rotation        y       y       y
scale           y       y       y
color           y
width
visibility
blend mode
x permutation
y permutation
z permutation
__________
A Line only knows:
* where it starts,
* where it ends,
* how wide it is,
* what colour it is.

Whether that width is displayed as:
* a 2D stroke,
* a flat ribbon,
* a glowing strip,
* or a round tube,
is entirely the renderer’s responsibility.

I think we’ve just uncovered another design principle for LineLab:
The data model describes the artwork. The renderer describes its physical realization.
That’s a clean separation, and it’s one I would try to preserve throughout the project.
__________
I've been thinking more about how I want to use this project when it is complete. My current thinking is that the Project owns the _co-ordinates_ of the Lines and the Group owns the Lines. The reason for that is that the Lines can change when, for example, the co-ordinates are sorted into a different order. Then they combine differently with each other and the Lines change.

In addition to that, I want that random numbers for _all_ the attributes of Line be generated at one time when the Project is brought into existence and that these numbers are considered as a materialPool. The Project will be brought into existence by telling it how many lines to make. After that it is my task to assign Lines to Groups and Groups to Layers. The materialPool can be treated as an urGroup, which may or may not be divided into subGroups. 
__________
When you sort X, Y, colour, or width, you’re not editing coordinates.
You’re changing the mapping from coordinate pools to points, and from points to lines.
__________
I’m beginning to think the truly general solution might be:
@dataclass
class AttributeSet:
    values: dict[str, list[float]]

Then:
attributes["x"]
attributes["width"]
attributes["curvature"]
attributes["anything_you_invent_later"]

LineLab would become infinitely extensible without changing the code.

A Group no longer stores geometry.
__________
It stores the recipe for producing geometry.
__________
A View could eventually be responsible for things like:
* sorting by x, y, z
* sorting by colour
* selecting subsets of lines
* filtering by layer or group
* mapping widths or colours for rendering
* animating through different orderings
__________
