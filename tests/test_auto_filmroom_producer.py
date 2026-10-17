import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("auto_filmroom",ROOT/"scripts/auto-filmroom-producer.py")
engine=importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)

class AutoFilmTests(unittest.TestCase):
    def setUp(self):
        self.script=("Fabio Wardley steps in behind the jab, while Daniel Dubois uses pressure and the right hand. "
                     "The weighing-in and face-off matter for the build-up, but they do not prove what will happen in the ring. ")*43
        self.sources=[
          dict(id="owned-"+str(i),provider="owner",rightsStatus="cleared",
               licenseProof="asset license "+str(i),localFile="scene-"+str(i)+".mp4",
               kind=["fight","weighin","training","press"][i%4],
               duration=42,displayName="Real archive footage",illustrative=False,
               namedFighterVerified=True)
          for i in range(9)
        ]

    def test_script_produces_narration_timed_beats(self):
        shots=engine.narrative_beats(self.script)
        self.assertGreater(len(shots),30)
        self.assertGreater(sum(s["duration"] for s in shots),300)
        self.assertTrue(all(s["duration"]<12 for s in shots))
        self.assertTrue(all(s["narration"] for s in shots))

    def test_source_rights_must_be_explicit(self):
        self.assertTrue(engine.allowed_source(self.sources[0]))
        self.assertFalse(engine.allowed_source({**self.sources[0],"licenseProof":""}))
        self.assertFalse(engine.allowed_source({**self.sources[0],"rightsStatus":"unknown"}))
        self.assertFalse(engine.allowed_source(dict(id="youtube",provider="YouTube",fileUrl="https://www.youtube.com/watch?v=X")))
        self.assertFalse(engine.safety_url("https://videos.pexels.com.attacker.com/fake.mp4"))
        self.assertTrue(engine.safety_url("https://videos.pexels.com/video-files/12345/12345-hd.mp4"))

    def test_five_minute_timeline_uses_real_source_ids(self):
        scenes=engine.assign(engine.narrative_beats(self.script),self.sources)
        self.assertGreater(len(scenes),30)
        self.assertTrue(all(s["assetId"].startswith("owned-") for s in scenes))
        self.assertGreater(len({s["assetId"] for s in scenes}),3)
        self.assertTrue(all(s["out"]>s["in"]>=0 and s["shotSeconds"]<=10 for s in scenes))

    def test_refuses_not_enough_distinct_real_footage(self):
        with self.assertRaisesRegex(ValueError,"need at least 3"):
            engine.assign(engine.narrative_beats(self.script),self.sources[:2])

    def test_unverified_stock_is_labelled_illustrative(self):
        source={**self.sources[0],"id":"pexels-4","provider":"Pexels","kind":"fight",
            "illustrative":True,"namedFighterVerified":False}
        scenes=engine.assign(engine.narrative_beats("Dubois punches in the ring. "*10),
                             [source]+self.sources[1:4])
        self.assertTrue(all(x["actualFighterFootage"] is False for x in scenes if x["assetId"]=="pexels-4"))

    def test_no_api_keys_means_blocked_not_fake_success(self):
        old=os.environ.pop("PEXELS_API_KEY",None)
        original_commons=engine.commons
        engine.commons=lambda query,role: []
        try:
            with tempfile.TemporaryDirectory() as tmp:
                import json
                source=Path(tmp)/"project.json"
                source.write_text(json.dumps({"slug":"fight-test","title":"Real fight",
                    "scripts":{"youtube":{"draft":" ".join(self.script.split(" ")[:850])}}}))
                arg=type("Args",(),dict(project=str(source),out=str(Path(tmp)/"out"),
                   media_dir=str(Path(tmp)/"media"),media_register=None,
                   dry_run=False,no_render=False))()
                result=engine.produce(arg)
                self.assertEqual(result["status"],"needs_licensed_footage")
                self.assertFalse((Path(tmp)/"out"/"roughcut-youtube.mp4").exists())
        finally:
            engine.commons=original_commons
            if old:os.environ["PEXELS_API_KEY"]=old

if __name__=="__main__":unittest.main()
