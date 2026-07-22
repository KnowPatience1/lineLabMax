from dataclasses import dataclass

@dataclass
class Vec3:
    x: float
    y: float
    z: float

    def __post_init__(self):
        self.validate()

    def validate(self):
        for name, value in (
            ("x", self.x),
            ("y", self.y),
            ("z", self.z),
        ):
            if not isinstance(value, (int, float)):
                raise TypeError(f"{name} must be a number")

    def to_tuple(self):
        return (self.x, self.y, self.z)
    
def ribbon_corners(
    start: Vec3,
    end: Vec3,
    width: float,
    ) -> tuple[Vec3, Vec3, Vec3, Vec3]:
    """Return the four corners of a ribbon in the XY plane."""

    dx = end.x - start.x
    dy = end.y - start.y

    length = (dx * dx + dy * dy) ** 0.5

    if length == 0:
        raise ValueError("Line has zero length.")

    # Unit direction vector
    ux = dx / length
    uy = dy / length

    # Perpendicular unit vector
    px = -uy
    py = ux

    half = width / 2.0

    offset_x = px * half
    offset_y = py * half

    a1 = Vec3(
        start.x + offset_x,
        start.y + offset_y,
        start.z,
    )

    a2 = Vec3(
        start.x - offset_x,
        start.y - offset_y,
        start.z,
    )

    b1 = Vec3(
        end.x + offset_x,
        end.y + offset_y,
        end.z,
    )

    b2 = Vec3(
        end.x - offset_x,
        end.y - offset_y,
        end.z,
    )

    return a1, a2, b1, b2