"""No fabricated visual observations: phrase-matched source transcripts only produce unapproved candidates."""
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("aura_video_suggest",ROOT/"scripts/suggest-real-footage-cuts.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class CutSuggestionTests(unittest.TestCase):
 def test_marks_transcript_mentions_not_verified_actions(self):
  cuts=module.propose({"segments":[
   {"start":15,"end":17,"text":"The jab was the key to controlling the range"},
   {"start":31,"end":33,"text":"Wardley scored a knockdown"},
   {"start":64,"end":67,"text":"They are standing by the ring"}
  ]},"first-fight-highlights")
  self.assertEqual(len(cuts),2)
  self.assertTrue(all(c["reviewStatus"]=="visual_verification_required" for c in cuts))
  self.assertTrue(all(c["out"]-c["in"]<=10 for c in cuts))

 def test_no_proposals_without_evidence(self):
  self.assertEqual(module.propose({"segments":[{"start":0,"end":5,"text":"Hello everybody"}]},"s"),[])

 def test_rejects_inappropriate_transcript_shape(self):
  with self.assertRaises(ValueError):module.propose({"text":"No timed segments"},"s")

if __name__=="__main__":
 unittest.main()
