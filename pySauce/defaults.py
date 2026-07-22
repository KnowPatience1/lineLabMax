"""
Default values used throughout LineLab.

These are project-wide defaults. In a future version they may
be overridden by Project-specific settings.
"""

from linelab.color import Color

DEFAULT_COLOR_MIN = Color(0.0, 0.0, 0.0, 1.0)
DEFAULT_COLOR_MAX = Color(1.0, 1.0, 1.0, 1.0)

DEFAULT_WIDTH_MIN = 0.001
DEFAULT_WIDTH_MAX = 0.010