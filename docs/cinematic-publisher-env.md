# Cinematic Publisher Environment

Set these in Vercel project settings, then redeploy.

Required:

- GITHUB_TOKEN: GitHub token for this repo with Contents read/write.

Optional defaults:

- GITHUB_OWNER=dakande85-bit
- GITHUB_REPO=aura-fight-club-cinematic
- GITHUB_BRANCH=main

The publish endpoint commits media files from replacement ZIP packs to the repo. It does not edit ScrollFilm.jsx or CampaignScrollFilm.jsx.
