from dataclasses import dataclass, field

from linelab.attributes import AttributeSet


@dataclass
class Project:
    """A complete LineLab project."""

    attributes: AttributeSet = field(default_factory=AttributeSet)