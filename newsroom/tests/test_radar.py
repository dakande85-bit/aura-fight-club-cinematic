"""Offline regression checks for editorial radar. No credentials or external calls."""
import importlib.util
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "newsroom-radar.py"
spec = importlib.util.spec_from_file_location("newsroom_radar", SCRIPT)
radar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(radar)
NOW = datetime(2026, 10, 15, 12, tzinfo=timezone.utc)

class RadarTests(unittest.TestCase):
    def test_rss_parsing_preserves_publisher_and_date(self):
        xml = b"""<rss><channel><item><title>Dubois calls out Wardley</title><link>https://news.google.com/a</link><pubDate>Thu, 15 Oct 2026 10:00:00 GMT</pubDate><source url="https://example.org">Original Publisher</source></item></channel></rss>"""
        result = radar.parse_rss(xml)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["source"], "Original Publisher")
        self.assertEqual(result[0]["published"], datetime(2026, 10, 15, 10, tzinfo=timezone.utc))

    def test_expired_coverage_discarded(self):
        older = {"title": "Dubois calls out Wardley", "url": "https://example.org/old", "source": "Outlet A", "published": NOW - timedelta(days=8)}
        self.assertEqual(radar.rank([older], [], [], NOW), [])

    def test_duplicate_story_ranks_lower_and_flagged(self):
        item = {"title": "Dubois Wardley rematch announced in London", "url": "https://example.org/a", "source": "Outlet A", "published": NOW}
        uncovered = radar.rank([item], [], [], NOW)[0]
        covered = radar.rank([item], [], [{"title": item["title"]}], NOW)[0]
        self.assertLess(covered["score"], uncovered["score"])
        self.assertTrue(covered["already_covered"])

    def test_risk_report_holds_claim_for_verification(self):
        item = {"title": "Dubois accused of cheating in Wardley rematch", "url": "https://example.org/a", "source": "Outlet A", "published": NOW}
        story = radar.rank([item], [], [], NOW)[0]
        self.assertEqual(story["verification"], "HOLD_FOR_ORIGINAL_SOURCE_AND_RESPONSE")
        self.assertIn("allegation", story["angle"])

    def test_trend_rises_above_identical_untrended_story(self):
        item = {"title": "Sebastian Fundora future title fight", "url": "https://example.org/a", "source": "Outlet A", "published": NOW}
        base = radar.rank([item], [], [], NOW)[0]["score"]
        with_trend = radar.rank([item], [{"topic": "Sebastian Fundora", "traffic": "10K+"}], [], NOW)[0]
        self.assertGreater(with_trend["score"], base)
        self.assertEqual(with_trend["google_trend"]["topic"], "Sebastian Fundora")

    def test_report_discloses_incomplete_signals(self):
        markdown = radar.render_md([], NOW, [], 0)
        self.assertIn("not measured", markdown)
        self.assertIn("No automatic publishing", markdown)

if __name__ == "__main__":
    unittest.main()
