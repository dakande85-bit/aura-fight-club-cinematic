"""Tests AURA multi-fight queue, source-backed scripts and dual-format real-footage validation."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

def imported(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

queue=imported("major_fight_queue","scripts/build-video-production-queue.py")
narration=imported("narration_seed","scripts/seed-video-narrations.py")
renderer=imported("real_video_renderer","scripts/render-fight-production.py")


class MajorFightProductionTests(unittest.TestCase):
    def setUp(self):
        fights=json.loads((ROOT/"public/news/fights.json").read_text())["fights"]
        self.dubois=next(f for f in fights if f["id"]=="dubois-wardley-2")

    def test_selects_major_headliner_and_world_title(self):
        self.assertTrue(queue.interesting(self.dubois))
        self.assertFalse(queue.interesting({"featured":False,"stakes":"Unscheduled sparring session"}))

    def test_seeds_only_video_search_leads_without_claiming_permissions(self):
        project=queue.build(self.dubois,None)
        self.assertEqual(project["shots"],[])
        self.assertFalse(project["scripts"]["youtube"]["approved"])
        self.assertTrue(all(s["clearedForExport"] is False for s in project["sources"]))
        self.assertTrue(any(s["candidateStatus"]=="search_lead_only" for s in project["sources"]))

    def test_sources_from_the_site_cannot_be_promoted_to_film_evidence(self):
        article={"fightId":"dubois-wardley-2","slug":"reviewed-dubois-tactics","body":[
          "Wardley threatened with early power, but accuracy, stamina, and footwork were the decisive questions. "*8,
          "The analysis must explain what each fighter will do at range, under pressure and after punching. "*8],
          "summary":"An important technical rematch."}
        long,short=narration.seed(article)
        self.assertIn("Wardley threatened",long)
        self.assertIn("An important technical rematch",short)
        self.assertNotIn("round three knockdown",long)

    def test_separates_two_releases_and_rejects_synthetic_marks(self):
        p=queue.build(self.dubois,None)
        p["shots"]=[
          {"id":"technical-001","sourceId":"calendar-official-video",
           "in":10,"out":13.5,"formats":["youtube"],"purpose":"evidence"},
          {"id":"hook-001","sourceId":"calendar-official-video",
           "in":20,"out":23.5,"formats":["shorts"],"purpose":"hook"}
        ]
        yes,_,length=renderer.validate(p,"youtube")
        short,_,length2=renderer.validate(p,"shorts")
        self.assertEqual(yes[0]["id"],"technical-001")
        self.assertEqual(short[0]["id"],"hook-001")
        self.assertEqual(length,3.5)
        self.assertEqual(length2,3.5)

    def test_flags_unmarked_or_unlawfully_reused_broadcasts(self):
        p=queue.build(self.dubois,None)
        with self.assertRaisesRegex(ValueError,"No real footage"):
            renderer.validate(p,"youtube")
        p["shots"]=[{"id":"a","sourceId":"calendar-official-video","in":1,"out":5,"formats":["youtube"]}]
        with self.assertRaisesRegex(ValueError,"rights review"):
            renderer.validate(p,"youtube",ROOT,files_required=True)

    def test_no_categorical_five_second_rule(self):
        p=queue.build(self.dubois,None)
        p["shots"]=[{"id":"a","sourceId":"calendar-official-video","in":1,"out":14,"formats":["youtube"]}]
        with self.assertRaisesRegex(ValueError,"editorial 12-second"):
            renderer.validate(p,"youtube")

    def test_rejects_external_urls_and_directory_traversal_as_media_paths(self):
        for path in ["https://youtube.com/watch?v=abc","../private.mp4","/tmp/film.mp4","x/film.mp4"]:
            with self.subTest(path=path):
                with self.assertRaises(ValueError):
                    renderer.local_media(ROOT,path)


if __name__=="__main__":
    unittest.main()
