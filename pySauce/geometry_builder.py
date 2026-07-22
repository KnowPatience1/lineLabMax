from linelab.attributes import AttributeSet
from linelab.color import Color
from linelab.geometry import Vec3
from linelab.line import Line
from linelab.line_definition import LineDefinition


class GeometryBuilder:
    """Builds Line objects from immutable project data."""

    def build_line(
        self,
        attributes: AttributeSet,
        definition: LineDefinition,
        line_id: int,
    ) -> Line:

        start = Vec3(
            attributes.x[definition.start],
            attributes.y[definition.start],
            attributes.z[definition.start],
        )

        end = Vec3(
            attributes.x[definition.end],
            attributes.y[definition.end],
            attributes.z[definition.end],
        )

        color = Color(
            attributes.r[definition.start],
            attributes.g[definition.start],
            attributes.b[definition.start],
            attributes.a[definition.start],
        )

        width = attributes.width[definition.start]

        print(
            f"definition=({definition.start}, {definition.end}) "
            f"start={start} end={end}"
        )

        return Line(
            id=line_id,
            start=start,
            end=end,
            color=color,
            width=width,
        )
    def build_lines(
        self,
        attributes: AttributeSet,
        definitions: list[LineDefinition],
        view,
    ) -> list[Line]:
        """Build multiple Line objects from a view mapping.

        The view is an iterable of entries with attributes `visible` and
        `line_index` referencing into definitions.
        """

        lines: list[Line] = []

        for line_id, entry in enumerate(view):
            if not entry.visible:
                continue

            definition = definitions[entry.line_index]
            lines.append(self.build_line(attributes, definition, line_id))

        return lines