import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('aura_youtube_ingest',ROOT/'scripts'/'aura_youtube_ingest.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

YOUTUBE='https://www.youtube.com/watch?v=XeGvFyry-sA'
def approved(**changes):
    return {
      'provider':'YouTube approved','fightId':'dubois-wardley-ii',
      'url':YOUTUBE,'rightsStatus':'cleared','rightsEvidence':'Written rights-holder license reference R123',
      'platformBasis':'youtube_written_approval',
      'platformEvidence':'YouTube written approval record Y567',
      'kind':'fight','namedFighterVerified':True,'title':'Approved boxing film',
      **changes
    }

class YouTubeIngestTests(unittest.TestCase):
    def test_only_real_public_youtube_urls(self):
        self.assertEqual(mod.video_id(YOUTUBE),'XeGvFyry-sA')
        self.assertEqual(mod.video_id('https://youtu.be/XeGvFyry-sA'),'XeGvFyry-sA')
        self.assertIsNone(mod.video_id('https://youtube.com.evil.test/watch?v=XeGvFyry-sA'))
        self.assertIsNone(mod.video_id('http://youtube.com/watch?v=XeGvFyry-sA'))
        self.assertIsNone(mod.video_id('https://www.youtube.com/watch?v=invalid'))
        self.assertIsNone(mod.video_id('https://www.youtube.com@attacker.test/watch?v=XeGvFyry-sA'))

    def test_platform_and_copyright_rights_are_separate_gates(self):
        self.assertTrue(mod.source_authorised(approved()))
        self.assertFalse(mod.source_authorised(approved(rightsEvidence='')))
        self.assertFalse(mod.source_authorised(approved(platformEvidence='')))
        self.assertFalse(mod.source_authorised(approved(platformBasis='guessing_fair_use')))
        self.assertFalse(mod.source_authorised(approved(rightsStatus='research_only')))
        self.assertFalse(mod.source_authorised(approved(namedFighterVerified=False)))
        self.assertFalse(mod.source_authorised(approved(url='https://evil.test/watch?v=XeGvFyry-sA')))

    def test_fight_scope_keeps_other_fighters_separate(self):
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'approved.json'
            file.write_text(json.dumps({'sources':[approved(),approved(fightId='other-fight')]}))
            found=mod.sources_from_register(file,'dubois-wardley-ii')
            self.assertEqual(len(found),1)
            self.assertEqual(found[0]['id'],'youtube-approved-XeGvFyry-sA')
            self.assertEqual(found[0]['platformEvidence'],'YouTube written approval record Y567')

    def test_yt_dlp_is_never_started_for_unapproved_video(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(mod.subprocess,'run') as proc:
                with self.assertRaisesRegex(mod.IngestRefused,'permissions'):
                    mod.ingest(approved(rightsStatus='research_only'),folder)
                proc.assert_not_called()

    def test_approved_video_uses_no_cookies_drm_or_login_in_download_command(self):
        with tempfile.TemporaryDirectory() as folder:
            captured=[]
            def fake_run(command,**kwargs):
                captured.extend(command)
                output=Path(command[command.index('--output')+1])
                output.write_bytes(b'0'*65000)
                return SimpleNamespace(returncode=0,stdout='',stderr='')
            with patch.object(mod.subprocess,'run',side_effect=fake_run):
                path=mod.ingest(approved(),folder)
            self.assertTrue(path.is_file())
            self.assertIn('--no-playlist',captured)
            self.assertIn('--max-filesize',captured)
            self.assertIn('--ignore-config',captured)
            self.assertNotIn('--cookies',captured)
            self.assertNotIn('--cookies-from-browser',captured)
            self.assertEqual(captured[-1],YOUTUBE)

    def test_discovery_never_marks_youtube_search_as_reusable(self):
        with patch.object(mod,'_api',return_value={'items':[{
            'id':{'videoId':'XeGvFyry-sA'},
            'snippet':{'title':'Historical fight','channelTitle':'Promo','publishedAt':'2026-10-17'}
        }]}):
            discovered,_=mod.discover('Wardley Dubois',key='test-api-key',max_per_role=2)
            self.assertEqual(len(discovered),1)
            self.assertEqual(discovered[0]['rightsStatus'],'research_only')
            self.assertFalse(discovered[0]['mediaDownloaded'])

if __name__=='__main__':unittest.main()
