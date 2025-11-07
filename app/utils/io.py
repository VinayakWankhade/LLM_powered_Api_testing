from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import yaml  # type: ignore


def load_yaml_or_json(path: str | Path) -> Dict[str, Any]:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if p.suffix.lower() in {".yaml", ".yml"}:
        return yaml.safe_load(text) or {}
    return json.loads(text)


