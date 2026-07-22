@dataclass(slots=True)
class Layer:
    id: int
    name: str = ""

    group_ids: list[int] = field(default_factory=list)