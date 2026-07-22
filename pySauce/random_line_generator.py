import random

from linelab.line_definition import LineDefinition
from linelab.attributes import AttributeSet
from linelab.line_generator import LineGenerator


class RandomLineGenerator(LineGenerator):

    def generate(
        self,
        attributes: AttributeSet,
    ) -> list[LineDefinition]:

        count = len(attributes.x)

        indices = list(range(count))
        random.shuffle(indices)

        definitions = []

        # Take the shuffled indices two at a time.
        for i in range(0, count - 1, 2):
            definitions.append(
                LineDefinition(
                    start=indices[i],
                    end=indices[i + 1],
                )
            )

        return definitions