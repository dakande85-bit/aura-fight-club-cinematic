"""Unit checks for real-footage EDL validation; no copyrighted footage needed."""
import importlib.util
import json
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("aura_real_video",ROOT/"scripts/render-real-footage-short.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RealFootageTests(unittest.TestCase):
    def setUp(self):
        self.project=json.loads((ROOT/"public/news/video-production/dubois-wardley-ii.json").read_text())

    def sample(self):
        project=json.loads(json.dumps(self.project))
        project["shots"]=[{"sourceId":"first-fight-highlights","in":10.5,"out":13.5,
                          "caption":"Check the exit","purpose":"Tactical evidence"}]
        return project

    def test_manifest_has_real_research_urls_and_no_fake_timestamps(self):
        self.assertEqual(self.project["shots"],[])
        self.assertIn("https://www.youtube.com/watch",self.project["sources"][0]["url"])
        self.assertFalse(self.project["sources"][0]["clearedForExport"])

    def test_requires_actual_marked_shots(self):
        with self.assertRaisesRegex(ValueError,"No cuts selected"):
            module.validate(self.project)

    def test_short_cut_validated(self):
        sources,duration=module.validate(self.sample())
        self.assertEqual(len(sources),len(self.project["sources"]))
        self.assertEqual(duration,3)

    def test_more_than_twelve_seconds_rejected(self):
        p=self.sample()
        p["shots"][0]["out"]=24
        with self.assertRaisesRegex(ValueError,"12 seconds"):
            module.validate(p)

    def test_rights_review_required_for_render(self):
        p=self.sample()
        p["sources"][0]["localFile"]="highlights.mp4"
        with self.assertRaisesRegex(ValueError,"reviewed"):
            module.validate(p,True,ROOT)

    def test_media_path_cannot_escape(self):
        for filename in ["../secrets.mp4","/tmp/video.mp4","https://youtube.com/watch",".."]:
            with self.subTest(filename=filename):
                with self.assertRaises(ValueError):
                    module.local_media(ROOT,filename)


if __name__=="__main__":
    unittest.main()
