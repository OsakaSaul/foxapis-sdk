// foxapis: a tiny JavaScript client generated from https://foxapis.com/openapi.json (v1.5.0) on 2026-11-18. One method per operation. Node 18+ and browsers.
// Regenerate with: node scripts/build-distribution.cjs in the foxapis-cf repo.
export class FoxAPIs {
  constructor({ apiKey, baseUrl = "https://api.foxapis.com" } = {}) {
    if (!apiKey) throw new Error("FoxAPIs: pass { apiKey }. A free trial key: https://foxapis.com/trial");
    this.apiKey = apiKey; this.baseUrl = baseUrl.replace(/\/+$/, "");
  }
  async request(method, path, { body, query } = {}) {
    const qs = query ? "?" + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)])).toString() : "";
    const r = await fetch(this.baseUrl + path + qs, { method, headers: { Authorization: "Bearer " + this.apiKey, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let data; try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!r.ok && r.status !== 202) { const e = new Error("FoxAPIs " + r.status + ": " + (data && (data.detail || data.error || data.message) ? JSON.stringify(data.detail || data.error || data.message) : text.slice(0, 200))); e.status = r.status; e.data = data; throw e; }
    return Object.assign(data && typeof data === "object" ? data : { value: data }, r.status === 202 ? { _async: true } : {});
  }
  /** Poll an async job (a method that answered 202) until status is "done". */
  async waitForJob(job, { intervalMs = 3000, timeoutMs = 180000 } = {}) {
    const id = typeof job === "string" ? job : (job.job_id || job.id); const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      const j = await this.jobsByJobId(id);
      if (j.status === "done" || j.status === "failed" || j.status === "error") return j;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("FoxAPIs: job " + id + " did not finish in time");
  }
  /** POST /v1/compare_subjects: Compare 2-10 real people/subjects side by side on sourced evidence, context-aware. 5 credits per subject. (The MCP `compare_subjects` method, now on REST.) */
  compareSubjects(body) { return this.request("POST", `/v1/compare_subjects`, { body: body, query: undefined }); }
  /** POST /v1/find_contact: Resolve a named person to a reachable, verified contact (identity, role, email/social). 100 credits on a real resolution; 0 when the person is unfindable. (The MCP `find_contact` method, now on REST.) */
  findContact(body) { return this.request("POST", `/v1/find_contact`, { body: body, query: undefined }); }
  /** POST /v1/get_dossier: Full sourced person dossier — identity, history, affiliations, red flags. Free on a cache hit. Cache hits return synchronously; cold pulls return 202 + poll. (The MCP `get_dossier` method, now on REST */
  getDossier(body) { return this.request("POST", `/v1/get_dossier`, { body: body, query: undefined }); }
  /** POST /v1/candidate_compare: Compare 2-10 candidates side by side against a role brief, on sourced evidence, for outreach and interview prep. 5 credits per candidate. */
  candidateCompare(body) { return this.request("POST", `/v1/candidate_compare`, { body: body, query: undefined }); }
  /** POST /v1/exec_compare: Compare 2-10 executives in an executive (leadership / competitor-exec) frame, on sourced evidence. 5 credits per executive. */
  execCompare(body) { return this.request("POST", `/v1/exec_compare`, { body: body, query: undefined }); }
  /** POST /v1/bulk_candidate_compare: Run several candidate comparisons in one call (e.g. one set per open role). 5 credits per subject, summed across all sets, metered ONCE after every set returns — a mid-loop upstream timeout charges no */
  bulkCandidateCompare(body) { return this.request("POST", `/v1/bulk_candidate_compare`, { body: body, query: undefined }); }
  /** POST /v1/enrich_person: Resolve a person to verified contact info and identity. mode:'deep' adds a full behavioral profile. */
  enrichPerson(body) { return this.request("POST", `/v1/enrich_person`, { body: body, query: undefined }); }
  /** POST /v1/compare_people: Rank 2+ people side by side. 5 credits per subject. */
  comparePeople(body) { return this.request("POST", `/v1/compare_people`, { body: body, query: undefined }); }
  /** GET /v1/investors/search: Search the verified-investor directory. 2 credits per call, charged on a successful result (empty results still count). Returns public profile fields plus a has_email flag; the reachable contact is th */
  investorsSearch(query) { return this.request("GET", `/v1/investors/search`, { body: undefined, query: query }); }
  /** POST /v1/investors/{investor_id}/enrich: Unlock the reachable, verified contact for one investor. Costs 30 credits, charged ONLY on a delivered email. If the investor already has a contact on file (shared pool), it is returned without a re-c */
  investorsByInvestorIdEnrich(investorId) { return this.request("POST", `/v1/investors/${encodeURIComponent(investorId)}/enrich`, { body: undefined, query: undefined }); }
  /** GET /v1/companies/search: Search the UK company register. 2 credits per call, charged on a successful result. Prefix name match keeps the query index-usable. Registry facts only. */
  companiesSearch(query) { return this.request("GET", `/v1/companies/search`, { body: undefined, query: query }); }
  /** GET /v1/companies/{company_number}: A single company's registry record plus its persons of significant control (up to 100, ceased ones last). 2 credits, charged when the company is found. Registry facts only — no contacts exist in this  */
  companiesByCompanyNumber(companyNumber) { return this.request("GET", `/v1/companies/${encodeURIComponent(companyNumber)}`, { body: undefined, query: undefined }); }
  /** POST /v1/vet_person: Check a person's stated claims against the public registers that settle them. Returns one verdict per claim with the register that decided it, the exact search run against that register, the record fo */
  vetPerson(body) { return this.request("POST", `/v1/vet_person`, { body: body, query: undefined }); }
  /** POST /v1/candidate_evaluate: Evaluate a candidate against a role. Free if the person is unfindable. Always async (202 + poll). */
  candidateEvaluate(body) { return this.request("POST", `/v1/candidate_evaluate`, { body: body, query: undefined }); }
  /** POST /v1/get_entrepreneur_report: Deep founder due-diligence report. Always async (202 + poll). Free if the subject is unfindable. */
  getEntrepreneurReport(body) { return this.request("POST", `/v1/get_entrepreneur_report`, { body: body, query: undefined }); }
  /** GET /v1/jobs/{job_id}: Poll an async job. Returns the sanitized result only when status='done'. */
  jobsByJobId(jobId) { return this.request("GET", `/v1/jobs/${encodeURIComponent(jobId)}`, { body: undefined, query: undefined }); }
  /** POST /v1/score_intent: Score the buyer intent of a social post. 2 credits. */
  scoreIntent(body) { return this.request("POST", `/v1/score_intent`, { body: body, query: undefined }); }
  /** POST /v1/get_investor_report: Snapshot OSINT report on an investor. 30 credits cold; 0 when only limited public data is found (the report's free indicator). */
  getInvestorReport(body) { return this.request("POST", `/v1/get_investor_report`, { body: body, query: undefined }); }
  /** POST /v1/generate_sales_dossier: Generate a per-company sales dossier from a domain. JSON only — the persisted copy is internal and not exposed. 30 credits. */
  generateSalesDossier(body) { return this.request("POST", `/v1/generate_sales_dossier`, { body: body, query: undefined }); }
  /** POST /v1/find_email: Find a verified email for a person at a company domain. 100 credits on a real match; 0 when no email is discoverable. */
  findEmail(body) { return this.request("POST", `/v1/find_email`, { body: body, query: undefined }); }
  /** POST /v1/analyze_influencer: Analyze a creator's influence (reach, engagement, audience quality, safety). 30 credits (snapshot) or 50 credits (depth='full'). Charges 0 and returns 422 if we cannot resolve a usable profile. */
  analyzeInfluencer(body) { return this.request("POST", `/v1/analyze_influencer`, { body: body, query: undefined }); }
  /** POST /v1/social/twitter/post: Extract X/Twitter post — text, author, engagement counts. */
  socialTwitterPost(body) { return this.request("POST", `/v1/social/twitter/post`, { body: body, query: undefined }); }
  /** POST /v1/social/reddit/post: Reddit post — score, comments, subreddit, full text, awards. */
  socialRedditPost(body) { return this.request("POST", `/v1/social/reddit/post`, { body: body, query: undefined }); }
  /** POST /v1/social/reddit/subreddit: Subreddit metadata — subscribers, active users, description. */
  socialRedditSubreddit(body) { return this.request("POST", `/v1/social/reddit/subreddit`, { body: body, query: undefined }); }
  /** POST /v1/social/bluesky/post: Bluesky post via AT Protocol — likes, reposts, replies, author. */
  socialBlueskyPost(body) { return this.request("POST", `/v1/social/bluesky/post`, { body: body, query: undefined }); }
  /** POST /v1/social/mastodon/post: Mastodon toot via ActivityPub — favourites, boosts, media. */
  socialMastodonPost(body) { return this.request("POST", `/v1/social/mastodon/post`, { body: body, query: undefined }); }
  /** POST /v1/social/linkedin/post: LinkedIn post — reactions, comments, author title+company. */
  socialLinkedinPost(body) { return this.request("POST", `/v1/social/linkedin/post`, { body: body, query: undefined }); }
  /** POST /v1/social/instagram/post: Instagram post — caption, hashtags, author. Vision recommended. */
  socialInstagramPost(body) { return this.request("POST", `/v1/social/instagram/post`, { body: body, query: undefined }); }
  /** POST /v1/social/instagram/reel: Instagram Reel — plays, caption, audio. Vision required for counts. */
  socialInstagramReel(body) { return this.request("POST", `/v1/social/instagram/reel`, { body: body, query: undefined }); }
  /** POST /v1/social/tiktok/video: TikTok video — caption, author, hashtags. Vision for engagement. */
  socialTiktokVideo(body) { return this.request("POST", `/v1/social/tiktok/video`, { body: body, query: undefined }); }
  /** POST /v1/social/facebook/post: Facebook post via mbasic fallback. */
  socialFacebookPost(body) { return this.request("POST", `/v1/social/facebook/post`, { body: body, query: undefined }); }
  /** POST /v1/brand/trustpilot/company: Trustpilot — TrustScore, rating distribution, review count. */
  brandTrustpilotCompany(body) { return this.request("POST", `/v1/brand/trustpilot/company`, { body: body, query: undefined }); }
  /** POST /v1/brand/g2/product: G2 product page — rating, category rank, badges. */
  brandG2Product(body) { return this.request("POST", `/v1/brand/g2/product`, { body: body, query: undefined }); }
  /** POST /v1/brand/capterra/product: Capterra product — rating, review count, free trial info. */
  brandCapterraProduct(body) { return this.request("POST", `/v1/brand/capterra/product`, { body: body, query: undefined }); }
  /** POST /v1/brand/producthunt/product: ProductHunt launch page — upvotes, rank, maker info. */
  brandProducthuntProduct(body) { return this.request("POST", `/v1/brand/producthunt/product`, { body: body, query: undefined }); }
  /** POST /v1/brand/reddit/brand-mentions: Reddit post with brand mention context. */
  brandRedditBrandMentions(body) { return this.request("POST", `/v1/brand/reddit/brand-mentions`, { body: body, query: undefined }); }
  /** POST /v1/talent/indeed/job: Indeed job posting — full description, tools detected. */
  talentIndeedJob(body) { return this.request("POST", `/v1/talent/indeed/job`, { body: body, query: undefined }); }
  /** POST /v1/talent/ziprecruiter/job: ZipRecruiter job — full description, tools detected, apply count. */
  talentZiprecruiterJob(body) { return this.request("POST", `/v1/talent/ziprecruiter/job`, { body: body, query: undefined }); }
  /** POST /v1/talent/monster/job: Monster job posting — JSON-LD extraction. */
  talentMonsterJob(body) { return this.request("POST", `/v1/talent/monster/job`, { body: body, query: undefined }); }
  /** POST /v1/talent/linkedin/job: LinkedIn job posting — vision recommended for full description. */
  talentLinkedinJob(body) { return this.request("POST", `/v1/talent/linkedin/job`, { body: body, query: undefined }); }
  /** POST /v1/talent/tools-detector: Detect competitor tool mentions in any job posting URL. */
  talentToolsDetector(body) { return this.request("POST", `/v1/talent/tools-detector`, { body: body, query: undefined }); }
  /** POST /v1/developer/github/repo: GitHub repo — stars, forks, topics, language, issues. Free API. */
  developerGithubRepo(body) { return this.request("POST", `/v1/developer/github/repo`, { body: body, query: undefined }); }
  /** POST /v1/developer/github/search: GitHub search — find repos/code/issues mentioning a term. */
  developerGithubSearch(body) { return this.request("POST", `/v1/developer/github/search`, { body: body, query: undefined }); }
  /** POST /v1/developer/stackoverflow/question: Stack Overflow — score, views, tags, accepted status. */
  developerStackoverflowQuestion(body) { return this.request("POST", `/v1/developer/stackoverflow/question`, { body: body, query: undefined }); }
  /** POST /v1/developer/hackernews/post: Hacker News post — score, comments, type. Free Firebase API. */
  developerHackernewsPost(body) { return this.request("POST", `/v1/developer/hackernews/post`, { body: body, query: undefined }); }
  /** POST /v1/developer/hackernews/comments: Fetch top-level HN comments for a post. */
  developerHackernewsComments(body) { return this.request("POST", `/v1/developer/hackernews/comments`, { body: body, query: undefined }); }
  /** POST /v1/ai-visibility/perplexity/answer: Perplexity shared answer — query, answer preview, brand mentions. */
  aiVisibilityPerplexityAnswer(body) { return this.request("POST", `/v1/ai-visibility/perplexity/answer`, { body: body, query: undefined }); }
  /** POST /v1/ai-visibility/gemini/answer: Gemini share link — answer + Google grounding sources. */
  aiVisibilityGeminiAnswer(body) { return this.request("POST", `/v1/ai-visibility/gemini/answer`, { body: body, query: undefined }); }
  /** POST /v1/ai-visibility/grok/answer: Grok share link — real-time X post citations, answer text. */
  aiVisibilityGrokAnswer(body) { return this.request("POST", `/v1/ai-visibility/grok/answer`, { body: body, query: undefined }); }
  /** POST /v1/ai-visibility/brand-audit: Multi-platform AI visibility audit via Perplexity share URL. */
  aiVisibilityBrandAudit(body) { return this.request("POST", `/v1/ai-visibility/brand-audit`, { body: body, query: undefined }); }
  /** POST /v1/geo/check: AI visibility score — checks if ChatGPT, Claude, Gemini, DeepSeek, Mistral recommend this brand. */
  geoCheck(body) { return this.request("POST", `/v1/geo/check`, { body: body, query: undefined }); }
  /** POST /v1/geo/gaps: Which AI prompts is this brand missing from? Returns specific queries where competitors appear instead. */
  geoGaps(body) { return this.request("POST", `/v1/geo/gaps`, { body: body, query: undefined }); }
  /** POST /v1/geo/share-of-voice: Competitive share of AI recommendations across all platforms. */
  geoShareOfVoice(body) { return this.request("POST", `/v1/geo/share-of-voice`, { body: body, query: undefined }); }
  /** POST /v1/geo/citation-rate: Per-LLM citation rates — how often each AI cites this brand. */
  geoCitationRate(body) { return this.request("POST", `/v1/geo/citation-rate`, { body: body, query: undefined }); }
  /** POST /v1/geo/heatmap: Win/loss by query category — comparison, how-to, alternative, pricing. */
  geoHeatmap(body) { return this.request("POST", `/v1/geo/heatmap`, { body: body, query: undefined }); }
  /** POST /v1/geo/train: Run AI training sequences to improve brand visibility. Returns session_id for polling. */
  geoTrain(body) { return this.request("POST", `/v1/geo/train`, { body: body, query: undefined }); }
  /** POST /v1/contact/find: Multi-source contact triangulation — email, phone, social handles with confidence scoring. */
  contactFind(body) { return this.request("POST", `/v1/contact/find`, { body: body, query: undefined }); }
  /** POST /v1/extract: Structured content extraction — YouTube transcripts, Reddit threads, article text. */
  extract(body) { return this.request("POST", `/v1/extract`, { body: body, query: undefined }); }
  /** POST /v1/content/youtube/video: YouTube video — title, views, likes, duration, tags, chapters. */
  contentYoutubeVideo(body) { return this.request("POST", `/v1/content/youtube/video`, { body: body, query: undefined }); }
  /** POST /v1/content/youtube/channel: YouTube channel stats. Pass channel URL: @handle, /channel/UC..., or /c/name formats. Returns: channel_name, handle, subscriber_count, video_count, view_count, description, joined_date, country, verif */
  contentYoutubeChannel(body) { return this.request("POST", `/v1/content/youtube/channel`, { body: body, query: undefined }); }
  /** POST /v1/content/substack/post: Substack post — title, likes, comments, paywall status, author. */
  contentSubstackPost(body) { return this.request("POST", `/v1/content/substack/post`, { body: body, query: undefined }); }
  /** POST /v1/content/substack/publication: Substack publication — name, subscriber count, category. */
  contentSubstackPublication(body) { return this.request("POST", `/v1/content/substack/publication`, { body: body, query: undefined }); }
  /** POST /v1/content/academic/paper: Academic paper — title, abstract, citation count, authors, PDF link. */
  contentAcademicPaper(body) { return this.request("POST", `/v1/content/academic/paper`, { body: body, query: undefined }); }
  /** POST /v1/content/podcast/episode: Podcast episode — title, show, duration, date, transcript availability. */
  contentPodcastEpisode(body) { return this.request("POST", `/v1/content/podcast/episode`, { body: body, query: undefined }); }
  /** POST /v1/visual/flickr/photo: Flickr photo — views, faves, EXIF data. */
  visualFlickrPhoto(body) { return this.request("POST", `/v1/visual/flickr/photo`, { body: body, query: undefined }); }
  /** POST /v1/visual/imgur/image: Imgur image/album — views, score, tags, dimensions. */
  visualImgurImage(body) { return this.request("POST", `/v1/visual/imgur/image`, { body: body, query: undefined }); }
  /** POST /v1/visual/pinterest/pin: Pinterest pin — description, image URL, board context. */
  visualPinterestPin(body) { return this.request("POST", `/v1/visual/pinterest/pin`, { body: body, query: undefined }); }
  /** POST /v1/util/smart-extract: Universal smart extract — detects platform, routes to best extractor. */
  utilSmartExtract(body) { return this.request("POST", `/v1/util/smart-extract`, { body: body, query: undefined }); }
  /** POST /v1/util/batch: Batch extract up to 10 URLs concurrently using smart-extract. */
  utilBatch(body) { return this.request("POST", `/v1/util/batch`, { body: body, query: undefined }); }
  /** GET /v1/util/platforms: List all supported platforms with their pack, credits, and extraction method. */
  utilPlatforms() { return this.request("GET", `/v1/util/platforms`, { body: undefined, query: undefined }); }
  /** GET /v1/util/health: Health check — no auth required. */
  utilHealth() { return this.request("GET", `/v1/util/health`, { body: undefined, query: undefined }); }
  /** POST /v1/developer/stackoverflow/user: Stack Overflow user profile. Pass user_id as numeric ID or full profile URL. Returns: display_name, reputation, badges (gold/silver/bronze), answer_count, question_count, location, website_url, accept */
  developerStackoverflowUser(body) { return this.request("POST", `/v1/developer/stackoverflow/user`, { body: body, query: undefined }); }
  /** POST /v1/brand/similarweb/domain: SimilarWeb domain traffic & ranking data. Pass domain as bare hostname (e.g. 'github.com') or full URL. Returns: global_rank, monthly_visits, bounce_rate, pages_per_visit, avg_visit_duration_sec, top_ */
  brandSimilarwebDomain(body) { return this.request("POST", `/v1/brand/similarweb/domain`, { body: body, query: undefined }); }
  /** POST /v1/social/reddit/user: Reddit user profile. Pass user_id as username, u/username, or full profile URL. Returns: name, link_karma, comment_karma, total_karma, account_age_days, is_gold, is_mod, verified, icon_img. */
  socialRedditUser(body) { return this.request("POST", `/v1/social/reddit/user`, { body: body, query: undefined }); }
  /** POST /v1/developer/github/user: GitHub user profile. Pass user_id as username or full profile URL. Returns: login, name, bio, company, location, blog, twitter_username, public_repos, public_gists, followers, following, account_age_d */
  developerGithubUser(body) { return this.request("POST", `/v1/developer/github/user`, { body: body, query: undefined }); }
  /** POST /v1/mobile/appstore/app: Apple App Store app details. Pass any App Store URL (apps.apple.com/...) or bare numeric App ID. Returns: title, developer, rating, rating_count, price, category, version, size_bytes, min_os, release_ */
  mobileAppstoreApp(body) { return this.request("POST", `/v1/mobile/appstore/app`, { body: body, query: undefined }); }
  /** POST /v1/mobile/googleplay/app: Google Play Store app details. Pass Google Play URL or bare package name (e.g. com.spotify.music). Returns: title, developer, rating, rating_count, installs, price, category, version, size, last_updat */
  mobileGoogleplayApp(body) { return this.request("POST", `/v1/mobile/googleplay/app`, { body: body, query: undefined }); }
  /** POST /v1/social/twitch/channel: Twitch channel stats. Pass a Twitch username or channel URL (e.g. twitch.tv/shroud). Returns: login, display_name, description, followers, is_live, viewer_count (if live), game (if live), stream_title */
  socialTwitchChannel(body) { return this.request("POST", `/v1/social/twitch/channel`, { body: body, query: undefined }); }
  /** POST /v1/content/steam/game: Steam game / app details. Pass a Steam store URL or bare App ID (e.g. 570 for Dota 2). Returns: app_id, title, type, developer, publisher, description, release_date, is_free, price, discount_percent,  */
  contentSteamGame(body) { return this.request("POST", `/v1/content/steam/game`, { body: body, query: undefined }); }
  /** POST /v1/developer/huggingface/model: HuggingFace model stats. Pass a model ID (e.g. mistralai/Mistral-7B-v0.1) or HuggingFace URL. Returns: model_id, author, pipeline_tag (task type), downloads_last_month, likes, tags, license, language, */
  developerHuggingfaceModel(body) { return this.request("POST", `/v1/developer/huggingface/model`, { body: body, query: undefined }); }
  /** POST /v1/crypto/coingecko/coin: CoinGecko coin data. Pass a CoinGecko coin ID (e.g. 'bitcoin', 'ethereum') or CoinGecko URL. Returns: coin_id, name, symbol, rank, price_usd, price_change_24h_pct, market_cap_usd, volume_24h_usd, circ */
  cryptoCoingeckoCoin(body) { return this.request("POST", `/v1/crypto/coingecko/coin`, { body: body, query: undefined }); }
  /** POST /v1/osint/wayback/domain: Wayback Machine snapshot history for a domain. Pass a domain (e.g. 'stripe.com') or full URL. Returns: domain, first_snapshot_date, last_snapshot_date, total_snapshots, most_active_year, years_archive */
  osintWaybackDomain(body) { return this.request("POST", `/v1/osint/wayback/domain`, { body: body, query: undefined }); }
  /** POST /v1/gaming/chess/player: Chess.com player stats. Pass a Chess.com username. Returns: username, title, country, joined_date, last_online, is_streamer, verified, league, bullet/blitz/rapid/daily ratings (current, best, record), */
  gamingChessPlayer(body) { return this.request("POST", `/v1/gaming/chess/player`, { body: body, query: undefined }); }
  /** POST /v1/gaming/lichess/player: Lichess player stats. Pass a Lichess username. Returns: username, title, patron, online, ultra_bullet/bullet/blitz/rapid/classical/correspondence ratings (each: rating, games, progress_trend, provisio */
  gamingLichessPlayer(body) { return this.request("POST", `/v1/gaming/lichess/player`, { body: body, query: undefined }); }
  /** POST /v1/ecommerce/shopify/store: Shopify store product catalog. Pass a Shopify store domain (e.g. 'gymshark.com' or 'allbirds.myshopify.com'). Returns: domain, total_products, total_variants, vendors (unique brands), product_types, p */
  ecommerceShopifyStore(body) { return this.request("POST", `/v1/ecommerce/shopify/store`, { body: body, query: undefined }); }
  /** POST /v1/music/soundcloud/artist: SoundCloud artist/user stats. Pass an artist name (e.g. 'Bonobo') or SoundCloud profile URL. Returns: user_id, username, display_name, followers, following, tracks_count, likes_count, reposts_count, p */
  musicSoundcloudArtist(body) { return this.request("POST", `/v1/music/soundcloud/artist`, { body: body, query: undefined }); }
  /** POST /v1/music/lastfm/artist: Last.fm artist stats. Pass an artist name (e.g. 'Radiohead') or Last.fm artist URL. Returns: name, listeners (total unique listeners, all-time), playcount (total scrobbles), bio_summary, tags (genres) */
  musicLastfmArtist(body) { return this.request("POST", `/v1/music/lastfm/artist`, { body: body, query: undefined }); }
  /** POST /v1/crypto/etherscan/wallet:  */
  cryptoEtherscanWallet(body) { return this.request("POST", `/v1/crypto/etherscan/wallet`, { body: body, query: undefined }); }
  /** POST /v1/crypto/defillama/protocol:  */
  cryptoDefillamaProtocol(body) { return this.request("POST", `/v1/crypto/defillama/protocol`, { body: body, query: undefined }); }
  /** POST /v1/science/pubmed/search:  */
  sciencePubmedSearch(body) { return this.request("POST", `/v1/science/pubmed/search`, { body: body, query: undefined }); }
  /** POST /v1/science/biorxiv/preprints:  */
  scienceBiorxivPreprints(body) { return this.request("POST", `/v1/science/biorxiv/preprints`, { body: body, query: undefined }); }
  /** POST /v1/science/clinicaltrials/search:  */
  scienceClinicaltrialsSearch(body) { return this.request("POST", `/v1/science/clinicaltrials/search`, { body: body, query: undefined }); }
  /** POST /v1/science/fda/approvals:  */
  scienceFdaApprovals(body) { return this.request("POST", `/v1/science/fda/approvals`, { body: body, query: undefined }); }
  /** POST /v1/patents/uspto/search:  */
  patentsUsptoSearch(body) { return this.request("POST", `/v1/patents/uspto/search`, { body: body, query: undefined }); }
  /** POST /v1/labor/bls/salary:  */
  laborBlsSalary(body) { return this.request("POST", `/v1/labor/bls/salary`, { body: body, query: undefined }); }
  /** POST /v1/augment/teardown:  */
  augmentTeardown(body) { return this.request("POST", `/v1/augment/teardown`, { body: body, query: undefined }); }
  /** POST /v1/augment/lead: Optional, light lead capture when a visitor downloads their Moat Map card. No hard gate — the card is shown and downloadable regardless; this just stores an email if the visitor chose to give one. */
  augmentLead(body) { return this.request("POST", `/v1/augment/lead`, { body: body, query: undefined }); }
  /** POST /v1/augment/preview:  */
  augmentPreview(body) { return this.request("POST", `/v1/augment/preview`, { body: body, query: undefined }); }
  /** POST /v1/augment/export:  */
  augmentExport(body) { return this.request("POST", `/v1/augment/export`, { body: body, query: undefined }); }
}
export default FoxAPIs;
