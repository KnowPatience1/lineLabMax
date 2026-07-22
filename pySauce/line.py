"""
LL-005 Line
Reference implementation for LineLab.

Version: 1.0-draft.1
"""

from __future__ import annotations
from linelab.geometry import Vec3
from linelab.color import Color
from dataclasses import dataclass, field
from typing import Any

VALID_SOURCES = {"line", "group"}

@dataclass(slots=True)
class Line:
    """
    Represents one immutable straight line segment.
    """

    id: int
    name: str = ""

    # Use default_factory so every Line gets its own Vec3 instance.
    start: Vec3 = field(default_factory=lambda: Vec3(0.0, 0.0, 0.0))
    end: Vec3 = field(default_factory=lambda: Vec3(0.0, 0.0, 0.0))

    color: Color = field(default_factory=lambda: Color(1., 1., 1., 1.))

    color_source: str = "line"

    width: float = 0.001

    linewidth_source: str = "line"

    visible: bool = True

    tags: list[str] = field(default_factory=list)

    # ---------------------------------------------------------
    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Raise ValueError if the Line is invalid."""

        if self.id < 0:
            raise ValueError("id must be non-negative")

        if self.width < 0:
            raise ValueError("width must be non-negative")

        if self.color_source not in VALID_SOURCES:
            raise ValueError(
                f"Unknown color_source '{self.color_source}'"
            )

        if self.linewidth_source not in VALID_SOURCES:
            raise ValueError(
                f"Unknown linewidth_source '{self.linewidth_source}'"
            )

    # ---------------------------------------------------------

    def to_dict(self) -> dict[str, Any]:

        return {
            "id": self.id,
            "name": self.name,
            "start": list(self.start.to_tuple()),
            "end": list(self.end.to_tuple()),
            "color": list(self.color.to_tuple()),
            "color_source": self.color_source,
            "width": self.width,
            "linewidth_source": self.linewidth_source,
            "visible": self.visible,
            "tags": self.tags,
        }

    # ---------------------------------------------------------

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Line":

        return cls(
            id=d["id"],
            name=d.get("name", ""),
            start=Vec3(*d["start"]),
            end=Vec3(*d["end"]),
            color=Color(*d["color"]),
            color_source=d.get("color_source", "line"),
            width=d.get("width", 0.001),
            linewidth_source=d.get("linewidth_source", "line"),
            visible=d.get("visible", True),
            tags=list(d.get("tags", [])),
        )