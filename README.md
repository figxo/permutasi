# Domain Name (`domainname.web.id`)

Tools to generate RFC 1035-compliant domain name permutations across 8 languages (`en`, `id`, `es`, `pt`, `fr`, `de`, `ru`, `ja`).

## Configuration (Google Analytics, Search Console, AdSense)

Edit `site.config.json` in the project root to set public tracking and verification IDs:

- `googleAnalytics.measurementId` — e.g. `G-XXXXXXXXXX`
- `googleSearchConsole.verificationToken` — `google-site-verification` meta content token
- `googleAdSense.publisherId` — e.g. `ca-pub-XXXXXXXXXXXXXXXX` (injects AdSense meta + script and generates `ads.txt`)
- `otherVerifications` — Bing, Yandex, Ahrefs meta tokens

> **Security Note:** Never place private or paid API keys in `site.config.json` or `index.html`. Keep private secrets in environment variables (`.env` locally or Cloudflare Pages Environment Variables) and access them only through server-side endpoints.

## Static Deployment (GitHub + Cloudflare Pages / DNS)

1. Push this repository to GitHub.
2. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**, select the repository.
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Attach your custom domain (`domainname.web.id`) managed in Cloudflare DNS.

Every `git push` builds pure static HTML (`dist/index.html`) with all verification `<meta>` tags, GA4, AdSense, `robots.txt`, `sitemap.xml`, and `ads.txt` baked directly into the response so Googlebot, GSC, AdSense crawlers, and user browsers receive static HTML immediately.

## Local Preview

```bash
npm install
npm run dev
```
