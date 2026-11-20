"""foxapis: a tiny Python client generated from https://foxapis.com/openapi.json (v1.5.0) on 2026-11-18.
One method per operation, standard library only. Regenerate with node scripts/build-distribution.cjs (foxapis-cf repo)."""
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from urllib.parse import quote

__version__ = "1.5.0"


class FoxAPIsError(Exception):
    def __init__(self, status, message, data=None):
        super().__init__(f"FoxAPIs {status}: {message}")
        self.status, self.data = status, data


class FoxAPIs:
    def __init__(self, api_key, base_url="https://api.foxapis.com", timeout=120):
        if not api_key:
            raise ValueError("FoxAPIs: pass api_key. A free trial key: https://foxapis.com/trial")
        self.api_key, self.base_url, self.timeout = api_key, base_url.rstrip("/"), timeout

    def request(self, method, path, body=None, query=None):
        url = self.base_url + path
        if query:
            url += "?" + urllib.parse.urlencode({k: v for k, v in query.items() if v is not None})
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method, headers={"Authorization": "Bearer " + self.api_key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                text, status = r.read().decode(), r.status
        except urllib.error.HTTPError as e:
            text, status = e.read().decode(), e.code
        try:
            parsed = json.loads(text) if text else None
        except ValueError:
            parsed = {"raw": text}
        if status >= 400:
            raise FoxAPIsError(status, str((parsed or {}).get("detail") or (parsed or {}).get("error") or text[:200]), parsed)
        out = parsed if isinstance(parsed, dict) else {"value": parsed}
        if status == 202:
            out["_async"] = True
        return out

    def wait_for_job(self, job, interval=3, timeout=180):
        """Poll an async job (a method that answered 202) until status is 'done'."""
        job_id = job if isinstance(job, str) else (job.get("job_id") or job.get("id"))
        end = time.time() + timeout
        while time.time() < end:
            j = self.jobs_by_job_id(job_id)
            if j.get("status") in ("done", "failed", "error"):
                return j
            time.sleep(interval)
        raise TimeoutError(f"FoxAPIs: job {job_id} did not finish in time")

    def compare_subjects(self, body: dict):
        """POST /v1/compare_subjects: Compare 2-10 real people/subjects side by side on sourced evidence, context-aware. 5 credits per subject. (The MCP `compare_subjects` method, now on REST.)"""
        return self.request("POST", f"/v1/compare_subjects", body=body)

    def find_contact(self, body: dict):
        """POST /v1/find_contact: Resolve a named person to a reachable, verified contact (identity, role, email/social). 100 credits on a real resolution; 0 when the person is unfindable. (The MCP `find_contact` method, now on REST.)"""
        return self.request("POST", f"/v1/find_contact", body=body)

    def get_dossier(self, body: dict):
        """POST /v1/get_dossier: Full sourced person dossier — identity, history, affiliations, red flags. Free on a cache hit. Cache hits return synchronously; cold pulls return 202 + poll. (The MCP `get_dossier` method, now on REST"""
        return self.request("POST", f"/v1/get_dossier", body=body)

    def candidate_compare(self, body: dict):
        """POST /v1/candidate_compare: Compare 2-10 candidates side by side against a role brief, on sourced evidence, for outreach and interview prep. 5 credits per candidate."""
        return self.request("POST", f"/v1/candidate_compare", body=body)

    def exec_compare(self, body: dict):
        """POST /v1/exec_compare: Compare 2-10 executives in an executive (leadership / competitor-exec) frame, on sourced evidence. 5 credits per executive."""
        return self.request("POST", f"/v1/exec_compare", body=body)

    def bulk_candidate_compare(self, body: dict):
        """POST /v1/bulk_candidate_compare: Run several candidate comparisons in one call (e.g. one set per open role). 5 credits per subject, summed across all sets, metered ONCE after every set returns — a mid-loop upstream timeout charges no"""
        return self.request("POST", f"/v1/bulk_candidate_compare", body=body)

    def enrich_person(self, body: dict):
        """POST /v1/enrich_person: Resolve a person to verified contact info and identity. mode:'deep' adds a full behavioral profile."""
        return self.request("POST", f"/v1/enrich_person", body=body)

    def compare_people(self, body: dict):
        """POST /v1/compare_people: Rank 2+ people side by side. 5 credits per subject."""
        return self.request("POST", f"/v1/compare_people", body=body)

    def investors_search(self, **query):
        """GET /v1/investors/search: Search the verified-investor directory. 2 credits per call, charged on a successful result (empty results still count). Returns public profile fields plus a has_email flag; the reachable contact is th"""
        return self.request("GET", f"/v1/investors/search", query=query)

    def investors_by_investor_id_enrich(self, investor_id):
        """POST /v1/investors/{investor_id}/enrich: Unlock the reachable, verified contact for one investor. Costs 30 credits, charged ONLY on a delivered email. If the investor already has a contact on file (shared pool), it is returned without a re-c"""
        return self.request("POST", f"/v1/investors/{quote(str(investor_id), safe='')}/enrich")

    def companies_search(self, **query):
        """GET /v1/companies/search: Search the UK company register. 2 credits per call, charged on a successful result. Prefix name match keeps the query index-usable. Registry facts only."""
        return self.request("GET", f"/v1/companies/search", query=query)

    def companies_by_company_number(self, company_number):
        """GET /v1/companies/{company_number}: A single company's registry record plus its persons of significant control (up to 100, ceased ones last). 2 credits, charged when the company is found. Registry facts only — no contacts exist in this """
        return self.request("GET", f"/v1/companies/{quote(str(company_number), safe='')}")

    def vet_person(self, body: dict):
        """POST /v1/vet_person: Check a person's stated claims against the public registers that settle them. Returns one verdict per claim with the register that decided it, the exact search run against that register, the record fo"""
        return self.request("POST", f"/v1/vet_person", body=body)

    def candidate_evaluate(self, body: dict):
        """POST /v1/candidate_evaluate: Evaluate a candidate against a role. Free if the person is unfindable. Always async (202 + poll)."""
        return self.request("POST", f"/v1/candidate_evaluate", body=body)

    def get_entrepreneur_report(self, body: dict):
        """POST /v1/get_entrepreneur_report: Deep founder due-diligence report. Always async (202 + poll). Free if the subject is unfindable."""
        return self.request("POST", f"/v1/get_entrepreneur_report", body=body)

    def jobs_by_job_id(self, job_id):
        """GET /v1/jobs/{job_id}: Poll an async job. Returns the sanitized result only when status='done'."""
        return self.request("GET", f"/v1/jobs/{quote(str(job_id), safe='')}")

    def score_intent(self, body: dict):
        """POST /v1/score_intent: Score the buyer intent of a social post. 2 credits."""
        return self.request("POST", f"/v1/score_intent", body=body)

    def get_investor_report(self, body: dict):
        """POST /v1/get_investor_report: Snapshot OSINT report on an investor. 30 credits cold; 0 when only limited public data is found (the report's free indicator)."""
        return self.request("POST", f"/v1/get_investor_report", body=body)

    def generate_sales_dossier(self, body: dict):
        """POST /v1/generate_sales_dossier: Generate a per-company sales dossier from a domain. JSON only — the persisted copy is internal and not exposed. 30 credits."""
        return self.request("POST", f"/v1/generate_sales_dossier", body=body)

    def find_email(self, body: dict):
        """POST /v1/find_email: Find a verified email for a person at a company domain. 100 credits on a real match; 0 when no email is discoverable."""
        return self.request("POST", f"/v1/find_email", body=body)

    def analyze_influencer(self, body: dict):
        """POST /v1/analyze_influencer: Analyze a creator's influence (reach, engagement, audience quality, safety). 30 credits (snapshot) or 50 credits (depth='full'). Charges 0 and returns 422 if we cannot resolve a usable profile."""
        return self.request("POST", f"/v1/analyze_influencer", body=body)

    def social_twitter_post(self, body: dict):
        """POST /v1/social/twitter/post: Extract X/Twitter post — text, author, engagement counts."""
        return self.request("POST", f"/v1/social/twitter/post", body=body)

    def social_reddit_post(self, body: dict):
        """POST /v1/social/reddit/post: Reddit post — score, comments, subreddit, full text, awards."""
        return self.request("POST", f"/v1/social/reddit/post", body=body)

    def social_reddit_subreddit(self, body: dict):
        """POST /v1/social/reddit/subreddit: Subreddit metadata — subscribers, active users, description."""
        return self.request("POST", f"/v1/social/reddit/subreddit", body=body)

    def social_bluesky_post(self, body: dict):
        """POST /v1/social/bluesky/post: Bluesky post via AT Protocol — likes, reposts, replies, author."""
        return self.request("POST", f"/v1/social/bluesky/post", body=body)

    def social_mastodon_post(self, body: dict):
        """POST /v1/social/mastodon/post: Mastodon toot via ActivityPub — favourites, boosts, media."""
        return self.request("POST", f"/v1/social/mastodon/post", body=body)

    def social_linkedin_post(self, body: dict):
        """POST /v1/social/linkedin/post: LinkedIn post — reactions, comments, author title+company."""
        return self.request("POST", f"/v1/social/linkedin/post", body=body)

    def social_instagram_post(self, body: dict):
        """POST /v1/social/instagram/post: Instagram post — caption, hashtags, author. Vision recommended."""
        return self.request("POST", f"/v1/social/instagram/post", body=body)

    def social_instagram_reel(self, body: dict):
        """POST /v1/social/instagram/reel: Instagram Reel — plays, caption, audio. Vision required for counts."""
        return self.request("POST", f"/v1/social/instagram/reel", body=body)

    def social_tiktok_video(self, body: dict):
        """POST /v1/social/tiktok/video: TikTok video — caption, author, hashtags. Vision for engagement."""
        return self.request("POST", f"/v1/social/tiktok/video", body=body)

    def social_facebook_post(self, body: dict):
        """POST /v1/social/facebook/post: Facebook post via mbasic fallback."""
        return self.request("POST", f"/v1/social/facebook/post", body=body)

    def brand_trustpilot_company(self, body: dict):
        """POST /v1/brand/trustpilot/company: Trustpilot — TrustScore, rating distribution, review count."""
        return self.request("POST", f"/v1/brand/trustpilot/company", body=body)

    def brand_g2_product(self, body: dict):
        """POST /v1/brand/g2/product: G2 product page — rating, category rank, badges."""
        return self.request("POST", f"/v1/brand/g2/product", body=body)

    def brand_capterra_product(self, body: dict):
        """POST /v1/brand/capterra/product: Capterra product — rating, review count, free trial info."""
        return self.request("POST", f"/v1/brand/capterra/product", body=body)

    def brand_producthunt_product(self, body: dict):
        """POST /v1/brand/producthunt/product: ProductHunt launch page — upvotes, rank, maker info."""
        return self.request("POST", f"/v1/brand/producthunt/product", body=body)

    def brand_reddit_brand_mentions(self, body: dict):
        """POST /v1/brand/reddit/brand-mentions: Reddit post with brand mention context."""
        return self.request("POST", f"/v1/brand/reddit/brand-mentions", body=body)

    def talent_indeed_job(self, body: dict):
        """POST /v1/talent/indeed/job: Indeed job posting — full description, tools detected."""
        return self.request("POST", f"/v1/talent/indeed/job", body=body)

    def talent_ziprecruiter_job(self, body: dict):
        """POST /v1/talent/ziprecruiter/job: ZipRecruiter job — full description, tools detected, apply count."""
        return self.request("POST", f"/v1/talent/ziprecruiter/job", body=body)

    def talent_monster_job(self, body: dict):
        """POST /v1/talent/monster/job: Monster job posting — JSON-LD extraction."""
        return self.request("POST", f"/v1/talent/monster/job", body=body)

    def talent_linkedin_job(self, body: dict):
        """POST /v1/talent/linkedin/job: LinkedIn job posting — vision recommended for full description."""
        return self.request("POST", f"/v1/talent/linkedin/job", body=body)

    def talent_tools_detector(self, body: dict):
        """POST /v1/talent/tools-detector: Detect competitor tool mentions in any job posting URL."""
        return self.request("POST", f"/v1/talent/tools-detector", body=body)

    def developer_github_repo(self, body: dict):
        """POST /v1/developer/github/repo: GitHub repo — stars, forks, topics, language, issues. Free API."""
        return self.request("POST", f"/v1/developer/github/repo", body=body)

    def developer_github_search(self, body: dict):
        """POST /v1/developer/github/search: GitHub search — find repos/code/issues mentioning a term."""
        return self.request("POST", f"/v1/developer/github/search", body=body)

    def developer_stackoverflow_question(self, body: dict):
        """POST /v1/developer/stackoverflow/question: Stack Overflow — score, views, tags, accepted status."""
        return self.request("POST", f"/v1/developer/stackoverflow/question", body=body)

    def developer_hackernews_post(self, body: dict):
        """POST /v1/developer/hackernews/post: Hacker News post — score, comments, type. Free Firebase API."""
        return self.request("POST", f"/v1/developer/hackernews/post", body=body)

    def developer_hackernews_comments(self, body: dict):
        """POST /v1/developer/hackernews/comments: Fetch top-level HN comments for a post."""
        return self.request("POST", f"/v1/developer/hackernews/comments", body=body)

    def ai_visibility_perplexity_answer(self, body: dict):
        """POST /v1/ai-visibility/perplexity/answer: Perplexity shared answer — query, answer preview, brand mentions."""
        return self.request("POST", f"/v1/ai-visibility/perplexity/answer", body=body)

    def ai_visibility_gemini_answer(self, body: dict):
        """POST /v1/ai-visibility/gemini/answer: Gemini share link — answer + Google grounding sources."""
        return self.request("POST", f"/v1/ai-visibility/gemini/answer", body=body)

    def ai_visibility_grok_answer(self, body: dict):
        """POST /v1/ai-visibility/grok/answer: Grok share link — real-time X post citations, answer text."""
        return self.request("POST", f"/v1/ai-visibility/grok/answer", body=body)

    def ai_visibility_brand_audit(self, body: dict):
        """POST /v1/ai-visibility/brand-audit: Multi-platform AI visibility audit via Perplexity share URL."""
        return self.request("POST", f"/v1/ai-visibility/brand-audit", body=body)

    def geo_check(self, body: dict):
        """POST /v1/geo/check: AI visibility score — checks if ChatGPT, Claude, Gemini, DeepSeek, Mistral recommend this brand."""
        return self.request("POST", f"/v1/geo/check", body=body)

    def geo_gaps(self, body: dict):
        """POST /v1/geo/gaps: Which AI prompts is this brand missing from? Returns specific queries where competitors appear instead."""
        return self.request("POST", f"/v1/geo/gaps", body=body)

    def geo_share_of_voice(self, body: dict):
        """POST /v1/geo/share-of-voice: Competitive share of AI recommendations across all platforms."""
        return self.request("POST", f"/v1/geo/share-of-voice", body=body)

    def geo_citation_rate(self, body: dict):
        """POST /v1/geo/citation-rate: Per-LLM citation rates — how often each AI cites this brand."""
        return self.request("POST", f"/v1/geo/citation-rate", body=body)

    def geo_heatmap(self, body: dict):
        """POST /v1/geo/heatmap: Win/loss by query category — comparison, how-to, alternative, pricing."""
        return self.request("POST", f"/v1/geo/heatmap", body=body)

    def geo_train(self, body: dict):
        """POST /v1/geo/train: Run AI training sequences to improve brand visibility. Returns session_id for polling."""
        return self.request("POST", f"/v1/geo/train", body=body)

    def contact_find(self, body: dict):
        """POST /v1/contact/find: Multi-source contact triangulation — email, phone, social handles with confidence scoring."""
        return self.request("POST", f"/v1/contact/find", body=body)

    def extract(self, body: dict):
        """POST /v1/extract: Structured content extraction — YouTube transcripts, Reddit threads, article text."""
        return self.request("POST", f"/v1/extract", body=body)

    def content_youtube_video(self, body: dict):
        """POST /v1/content/youtube/video: YouTube video — title, views, likes, duration, tags, chapters."""
        return self.request("POST", f"/v1/content/youtube/video", body=body)

    def content_youtube_channel(self, body: dict):
        """POST /v1/content/youtube/channel: YouTube channel stats. Pass channel URL: @handle, /channel/UC..., or /c/name formats. Returns: channel_name, handle, subscriber_count, video_count, view_count, description, joined_date, country, verif"""
        return self.request("POST", f"/v1/content/youtube/channel", body=body)

    def content_substack_post(self, body: dict):
        """POST /v1/content/substack/post: Substack post — title, likes, comments, paywall status, author."""
        return self.request("POST", f"/v1/content/substack/post", body=body)

    def content_substack_publication(self, body: dict):
        """POST /v1/content/substack/publication: Substack publication — name, subscriber count, category."""
        return self.request("POST", f"/v1/content/substack/publication", body=body)

    def content_academic_paper(self, body: dict):
        """POST /v1/content/academic/paper: Academic paper — title, abstract, citation count, authors, PDF link."""
        return self.request("POST", f"/v1/content/academic/paper", body=body)

    def content_podcast_episode(self, body: dict):
        """POST /v1/content/podcast/episode: Podcast episode — title, show, duration, date, transcript availability."""
        return self.request("POST", f"/v1/content/podcast/episode", body=body)

    def visual_flickr_photo(self, body: dict):
        """POST /v1/visual/flickr/photo: Flickr photo — views, faves, EXIF data."""
        return self.request("POST", f"/v1/visual/flickr/photo", body=body)

    def visual_imgur_image(self, body: dict):
        """POST /v1/visual/imgur/image: Imgur image/album — views, score, tags, dimensions."""
        return self.request("POST", f"/v1/visual/imgur/image", body=body)

    def visual_pinterest_pin(self, body: dict):
        """POST /v1/visual/pinterest/pin: Pinterest pin — description, image URL, board context."""
        return self.request("POST", f"/v1/visual/pinterest/pin", body=body)

    def util_smart_extract(self, body: dict):
        """POST /v1/util/smart-extract: Universal smart extract — detects platform, routes to best extractor."""
        return self.request("POST", f"/v1/util/smart-extract", body=body)

    def util_batch(self, body: dict):
        """POST /v1/util/batch: Batch extract up to 10 URLs concurrently using smart-extract."""
        return self.request("POST", f"/v1/util/batch", body=body)

    def util_platforms(self):
        """GET /v1/util/platforms: List all supported platforms with their pack, credits, and extraction method."""
        return self.request("GET", f"/v1/util/platforms")

    def util_health(self):
        """GET /v1/util/health: Health check — no auth required."""
        return self.request("GET", f"/v1/util/health")

    def developer_stackoverflow_user(self, body: dict):
        """POST /v1/developer/stackoverflow/user: Stack Overflow user profile. Pass user_id as numeric ID or full profile URL. Returns: display_name, reputation, badges (gold/silver/bronze), answer_count, question_count, location, website_url, accept"""
        return self.request("POST", f"/v1/developer/stackoverflow/user", body=body)

    def brand_similarweb_domain(self, body: dict):
        """POST /v1/brand/similarweb/domain: SimilarWeb domain traffic & ranking data. Pass domain as bare hostname (e.g. 'github.com') or full URL. Returns: global_rank, monthly_visits, bounce_rate, pages_per_visit, avg_visit_duration_sec, top_"""
        return self.request("POST", f"/v1/brand/similarweb/domain", body=body)

    def social_reddit_user(self, body: dict):
        """POST /v1/social/reddit/user: Reddit user profile. Pass user_id as username, u/username, or full profile URL. Returns: name, link_karma, comment_karma, total_karma, account_age_days, is_gold, is_mod, verified, icon_img."""
        return self.request("POST", f"/v1/social/reddit/user", body=body)

    def developer_github_user(self, body: dict):
        """POST /v1/developer/github/user: GitHub user profile. Pass user_id as username or full profile URL. Returns: login, name, bio, company, location, blog, twitter_username, public_repos, public_gists, followers, following, account_age_d"""
        return self.request("POST", f"/v1/developer/github/user", body=body)

    def mobile_appstore_app(self, body: dict):
        """POST /v1/mobile/appstore/app: Apple App Store app details. Pass any App Store URL (apps.apple.com/...) or bare numeric App ID. Returns: title, developer, rating, rating_count, price, category, version, size_bytes, min_os, release_"""
        return self.request("POST", f"/v1/mobile/appstore/app", body=body)

    def mobile_googleplay_app(self, body: dict):
        """POST /v1/mobile/googleplay/app: Google Play Store app details. Pass Google Play URL or bare package name (e.g. com.spotify.music). Returns: title, developer, rating, rating_count, installs, price, category, version, size, last_updat"""
        return self.request("POST", f"/v1/mobile/googleplay/app", body=body)

    def social_twitch_channel(self, body: dict):
        """POST /v1/social/twitch/channel: Twitch channel stats. Pass a Twitch username or channel URL (e.g. twitch.tv/shroud). Returns: login, display_name, description, followers, is_live, viewer_count (if live), game (if live), stream_title"""
        return self.request("POST", f"/v1/social/twitch/channel", body=body)

    def content_steam_game(self, body: dict):
        """POST /v1/content/steam/game: Steam game / app details. Pass a Steam store URL or bare App ID (e.g. 570 for Dota 2). Returns: app_id, title, type, developer, publisher, description, release_date, is_free, price, discount_percent, """
        return self.request("POST", f"/v1/content/steam/game", body=body)

    def developer_huggingface_model(self, body: dict):
        """POST /v1/developer/huggingface/model: HuggingFace model stats. Pass a model ID (e.g. mistralai/Mistral-7B-v0.1) or HuggingFace URL. Returns: model_id, author, pipeline_tag (task type), downloads_last_month, likes, tags, license, language,"""
        return self.request("POST", f"/v1/developer/huggingface/model", body=body)

    def crypto_coingecko_coin(self, body: dict):
        """POST /v1/crypto/coingecko/coin: CoinGecko coin data. Pass a CoinGecko coin ID (e.g. 'bitcoin', 'ethereum') or CoinGecko URL. Returns: coin_id, name, symbol, rank, price_usd, price_change_24h_pct, market_cap_usd, volume_24h_usd, circ"""
        return self.request("POST", f"/v1/crypto/coingecko/coin", body=body)

    def osint_wayback_domain(self, body: dict):
        """POST /v1/osint/wayback/domain: Wayback Machine snapshot history for a domain. Pass a domain (e.g. 'stripe.com') or full URL. Returns: domain, first_snapshot_date, last_snapshot_date, total_snapshots, most_active_year, years_archive"""
        return self.request("POST", f"/v1/osint/wayback/domain", body=body)

    def gaming_chess_player(self, body: dict):
        """POST /v1/gaming/chess/player: Chess.com player stats. Pass a Chess.com username. Returns: username, title, country, joined_date, last_online, is_streamer, verified, league, bullet/blitz/rapid/daily ratings (current, best, record),"""
        return self.request("POST", f"/v1/gaming/chess/player", body=body)

    def gaming_lichess_player(self, body: dict):
        """POST /v1/gaming/lichess/player: Lichess player stats. Pass a Lichess username. Returns: username, title, patron, online, ultra_bullet/bullet/blitz/rapid/classical/correspondence ratings (each: rating, games, progress_trend, provisio"""
        return self.request("POST", f"/v1/gaming/lichess/player", body=body)

    def ecommerce_shopify_store(self, body: dict):
        """POST /v1/ecommerce/shopify/store: Shopify store product catalog. Pass a Shopify store domain (e.g. 'gymshark.com' or 'allbirds.myshopify.com'). Returns: domain, total_products, total_variants, vendors (unique brands), product_types, p"""
        return self.request("POST", f"/v1/ecommerce/shopify/store", body=body)

    def music_soundcloud_artist(self, body: dict):
        """POST /v1/music/soundcloud/artist: SoundCloud artist/user stats. Pass an artist name (e.g. 'Bonobo') or SoundCloud profile URL. Returns: user_id, username, display_name, followers, following, tracks_count, likes_count, reposts_count, p"""
        return self.request("POST", f"/v1/music/soundcloud/artist", body=body)

    def music_lastfm_artist(self, body: dict):
        """POST /v1/music/lastfm/artist: Last.fm artist stats. Pass an artist name (e.g. 'Radiohead') or Last.fm artist URL. Returns: name, listeners (total unique listeners, all-time), playcount (total scrobbles), bio_summary, tags (genres)"""
        return self.request("POST", f"/v1/music/lastfm/artist", body=body)

    def crypto_etherscan_wallet(self, body: dict):
        """POST /v1/crypto/etherscan/wallet: """
        return self.request("POST", f"/v1/crypto/etherscan/wallet", body=body)

    def crypto_defillama_protocol(self, body: dict):
        """POST /v1/crypto/defillama/protocol: """
        return self.request("POST", f"/v1/crypto/defillama/protocol", body=body)

    def science_pubmed_search(self, body: dict):
        """POST /v1/science/pubmed/search: """
        return self.request("POST", f"/v1/science/pubmed/search", body=body)

    def science_biorxiv_preprints(self, body: dict):
        """POST /v1/science/biorxiv/preprints: """
        return self.request("POST", f"/v1/science/biorxiv/preprints", body=body)

    def science_clinicaltrials_search(self, body: dict):
        """POST /v1/science/clinicaltrials/search: """
        return self.request("POST", f"/v1/science/clinicaltrials/search", body=body)

    def science_fda_approvals(self, body: dict):
        """POST /v1/science/fda/approvals: """
        return self.request("POST", f"/v1/science/fda/approvals", body=body)

    def patents_uspto_search(self, body: dict):
        """POST /v1/patents/uspto/search: """
        return self.request("POST", f"/v1/patents/uspto/search", body=body)

    def labor_bls_salary(self, body: dict):
        """POST /v1/labor/bls/salary: """
        return self.request("POST", f"/v1/labor/bls/salary", body=body)

    def augment_teardown(self, body: dict):
        """POST /v1/augment/teardown: """
        return self.request("POST", f"/v1/augment/teardown", body=body)

    def augment_lead(self, body: dict):
        """POST /v1/augment/lead: Optional, light lead capture when a visitor downloads their Moat Map card. No hard gate — the card is shown and downloadable regardless; this just stores an email if the visitor chose to give one."""
        return self.request("POST", f"/v1/augment/lead", body=body)

    def augment_preview(self, body: dict):
        """POST /v1/augment/preview: """
        return self.request("POST", f"/v1/augment/preview", body=body)

    def augment_export(self, body: dict):
        """POST /v1/augment/export: """
        return self.request("POST", f"/v1/augment/export", body=body)
