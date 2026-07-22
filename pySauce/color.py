from dataclasses import dataclass

@dataclass
class Color:
    r: float
    g: float
    b: float
    a: float

    def __post_init__(self):

        self.validate()

    def validate(self):

        for name, value in (

            ("r", self.r),

            ("g", self.g),

            ("b", self.b),

            ("a", self.a),

        ):

            if not isinstance(value, (int, float)):

                raise TypeError(f"{name} must be a number")

            if not (0.0 <= value <= 1.0):

                raise ValueError(f"{name} must lie between 0.0 and 1.0")

    def to_tuple(self):
        return (self.r, self.g, self.b, self.a)
    