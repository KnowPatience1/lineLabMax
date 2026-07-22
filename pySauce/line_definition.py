from dataclasses import dataclass


@dataclass(frozen=True)
class LineDefinition:
    """Defines a line by the indices of its start and end points."""

    start: int
    end: int