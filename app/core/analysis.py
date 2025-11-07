from typing import Any, Dict


class AnalyticsService:
    async def summary(self) -> Dict[str, Any]:
        # Placeholder analytics
        return {
            "tests_total": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "coverage": {"statement": 0.0, "branch": 0.0},
        }


