from dataclasses import dataclass, field


@dataclass
class AttributeSet:
    """Immutable pools of attribute values."""

    x: list[float] = field(default_factory=list)
    y: list[float] = field(default_factory=list)
    z: list[float] = field(default_factory=list)

    r: list[float] = field(default_factory=list)
    g: list[float] = field(default_factory=list)
    b: list[float] = field(default_factory=list)
    a: list[float] = field(default_factory=list)

    width: list[float] = field(default_factory=list)

    def __post_init__(self):
        self._validate()

    def _validate(self):
        """Check that all attribute lists have the same length."""

        n = len(self.x)

        for name in (
            "y",
            "z",
            "r",
            "g",
            "b",
            "a",
            "width",
        ):
            values = getattr(self, name)
            if len(values) != n:
                raise ValueError(
                    f"{name} has length {len(values)}, expected {n}"
                )