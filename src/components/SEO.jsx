import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_URL = 'https://aurafightclub.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/aura-live/hero/hero-fighter-stance.png`;

const routeSeo = {
  '/': {
    title: 'AURA Fight Club | Boxing News, Fight Analysis, Rankings & Lifestyle',
    description: 'Independent boxing news, fight analysis, rankings, fight calendar, interviews and boxing lifestyle from AURA Fight Club.',
  },
  '/news': {
    title: 'Boxing News & Fight Analysis | AURA Fight Club',
    description: 'Latest boxing news, in-depth fight analysis, predictions, features and original opinion from the AURA Fight Club fight desk.',
  },
  '/calendar': {
    title: 'Boxing Fight Calendar 2026 | Upcoming Fights & How to Watch',
    description: 'Track major upcoming boxing fights, dates, venues, broadcasters and fight-week coverage with the AURA Fight Club boxing calendar.',
  },
  '/rankings': {
    title: 'Boxing Rankings 2026 | WBA, WBC, IBF, WBO & Pound-for-Pound',
    description: 'Explore boxing champions, contenders, sanctioning-body rankings and AURA Fight Club pound-for-pound coverage.',
  },
  '/watch': {
    title: 'Boxing Videos, Interviews & Press Conferences | AURA Fight Club',
    description: 'Watch official boxing interviews, press conferences, fight-week videos and behind-the-scenes coverage curated by AURA Fight Club.',
  },
  '/lifestyle': {
    title: 'Boxing Lifestyle, Style & Culture | AURA Fight Club',
    description: 'Boxing lifestyle, footwear, apparel concepts, training culture and exclusive AURA Fight Club designs for members.',
  },
  '/members': {
    title: 'AURA Fight Club Membership | Exclusive Boxing Lifestyle Access',
    description: 'Join AURA Fight Club for access to exclusive boxing lifestyle concepts, member releases and community updates.',
  },
  '/who-we-are': {
    title: 'About AURA Fight Club | Boxing Media, YouTube & Lifestyle',
    description: 'AURA Fight Club is an independent boxing media and lifestyle platform covering news, original analysis, YouTube content and fight culture.',
  },
  '/advertise': {
    title: 'Advertise with AURA Fight Club | Boxing Audience Partnerships',
    description: 'Partner with AURA Fight Club to reach boxing fans through editorial, video, event and lifestyle placements.',
  },
};

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === '') el.removeAttribute(key);
    else el.setAttribute(key, String(value));
  });
  return el;
}

function setCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

function setSchema(schema) {
  let el = document.getElementById('aura-page-schema');
  if (!schema) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = 'aura-page-schema';
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

export function PageSEO({
  title,
  description,
  canonicalPath,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  schema,
}) {
  const location = useLocation();
  useEffect(() => {
    const canonical = `${SITE_URL}${canonicalPath || location.pathname}`;
    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'AURA Fight Club' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    setCanonical(canonical);
    setSchema(schema);
  }, [title, description, canonicalPath, image, type, noindex, schema, location.pathname]);
  return null;
}

export function GlobalSEO() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/cart';
  const isArticle = location.pathname.startsWith('/news/');
  const data = routeSeo[location.pathname] || (isArticle ? {
    title: 'Boxing News & Analysis | AURA Fight Club',
    description: 'Original boxing reporting, analysis and opinion from AURA Fight Club.',
  } : {
    title: 'AURA Fight Club | Boxing News & Culture',
    description: 'Boxing news, analysis, rankings, fight coverage and lifestyle from AURA Fight Club.',
  });

  const baseSchema = location.pathname === '/' ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'AURA Fight Club',
        url: SITE_URL,
        logo: `${SITE_URL}/assets/aura-live/logos/mark-white.png`,
        description: 'Independent boxing media, analysis, video and lifestyle platform.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'AURA Fight Club',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
      },
    ],
  } : undefined;

  return <PageSEO {...data} noindex={isAdmin} schema={baseSchema} />;
}
