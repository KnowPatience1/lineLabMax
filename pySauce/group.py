from dataclasses import dataclass, field
from typing import Any
from linelab.color import Color
from linelab.defaults import (
    DEFAULT_COLOR_MIN,
    DEFAULT_COLOR_MAX,
    DEFAULT_WIDTH_MIN,
    DEFAULT_WIDTH_MAX,
)


@dataclass(slots=True)
class Group:
    id: int
    name: str = ""

    line_ids: list[int] = field(default_factory=list)

    color_min: Color = field(
        default_factory=lambda: Color(
            DEFAULT_COLOR_MIN.r,
            DEFAULT_COLOR_MIN.g,
            DEFAULT_COLOR_MIN.b,
            DEFAULT_COLOR_MIN.a,
        )
    )

    color_max: Color = field(
        default_factory=lambda: Color(
            DEFAULT_COLOR_MAX.r,
            DEFAULT_COLOR_MAX.g,
            DEFAULT_COLOR_MAX.b,
            DEFAULT_COLOR_MAX.a,
        )
    )

    width_min: float = DEFAULT_WIDTH_MIN
    width_max: float = DEFAULT_WIDTH_MAX

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:

        if self.id < 0:
            raise ValueError("id must be non-negative")

        if self.width_min < 0:
            raise ValueError("width_min must be non-negative")

        if self.width_max < self.width_min:
            raise ValueError(
            "width_max must be greater than or equal to width_min"
        )

        # ---------------------------------------------------------

    def to_dict(self) -> dict:

        return {
            "id": self.id,
            "name": self.name,
            "line_ids": self.line_ids,
            "color_min": list(self.color_min.to_tuple()),
            "color_max": list(self.color_max.to_tuple()),
            "width_min": self.width_min,
            "width_max": self.width_max,
        }
        # ---------------------------------------------------------

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Group":

        return cls(
            id=d["id"],
            name=d.get("name", ""),
            line_ids=list(d.get("line_ids", [])),
            color_min=Color(*d["color_min"]),
            color_max=Color(*d["color_max"]),
            width_min=d.get("width_min", DEFAULT_WIDTH_MIN),
            width_max=d.get("width_max", DEFAULT_WIDTH_MAX),
        )