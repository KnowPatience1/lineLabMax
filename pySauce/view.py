from dataclasses import dataclass

@dataclass
class ViewEntry:
    """A single entry in a View."""

    line_index: int
    visible: bool = True

class View:
    """A View controls which LineDefinitions are rendered."""

    def __init__(self, line_count: int):
        self.entries = [
            ViewEntry(i)
            for i in range(line_count)
        ]

    def __len__(self):
        return len(self.entries)

    def __iter__(self):
        return iter(self.entries)

    def show(self, line_index: int):
        self.entries[line_index].visible = True

    def hide(self, line_index: int):
        self.entries[line_index].visible = False

    def toggle(self, line_index: int):
        entry = self.entries[line_index]
        entry.visible = not entry.visible

    def show_all(self):
        for entry in self.entries:
            entry.visible = True

    def hide_all(self):
        for entry in self.entries:
            entry.visible = False