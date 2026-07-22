import random

from linelab.attributes import AttributeSet


def create_random_attributes(
    point_count: int,
) -> AttributeSet:
    """Create a random AttributeSet."""

    return AttributeSet(
        x=[random.uniform(-1.0, 1.0) for _ in range(point_count)],
        y=[random.uniform(-1.0, 1.0) for _ in range(point_count)],
        z=[random.uniform(-1.0, 1.0) for _ in range(point_count)],

        r=[random.random() for _ in range(point_count)],
        g=[random.random() for _ in range(point_count)],
        b=[random.random() for _ in range(point_count)],
        a=[
            random.uniform(0.05, 1.0)
            for _ in range(point_count)
        ],
        width=[0.02 for _ in range(point_count)],
    )