from abc import ABC, abstractmethod

from linelab.attributes import AttributeSet


class LineGenerator(ABC):
    """Base class for all line generation algorithms."""

    @abstractmethod
    def generate(
        self,
        attributes: AttributeSet,
    ) -> list[tuple[int, int]]:
        """Return a list of (start_index, end_index) pairs."""
        pass