# Is Math Biased? — AI vs Human Error Analyser

A MATH+AI Futures project for MATH 10.

**Big Question:** Is math biased? Can the formula we choose decide whether AI or humans come out on top?

The website is one file, `index.html`. It needs no installation, no build step and no server. Everything, including
any data loaded on the Research Data tab, runs inside the visitor's own browser and is never uploaded.

## Updating the AI results

The You vs AI answers are in `index.html`, in the block starting `const AI_MODELS = [`.
Each model has a name, version, test date and its answer to questions 1–20.

## 1. Put the files on GitHub
1. Sign in at github.com and click **New** (new repository).
2. Name it, for example `is-math-biased`. Set it to **Public**. Click **Create repository**.
3. Click **uploading an existing file**, drag in `index.html` and `README.md`, then click **Commit changes**.

Do not upload real participant data with names. A public repository can be read by anyone.

## 2. Publish with Cloudflare Pages
1. Sign in at dash.cloudflare.com (a free account works) and open **Workers & Pages**.
2. Click **Create application**, choose the **Pages** tab, then **Import an existing Git repository**.
3. Connect your GitHub account when asked, select `is-math-biased`, then click **Begin setup**.
4. Set up builds and deployments:
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `exit 0`
   - Build output directory: `/`
5. Click **Save and Deploy**. After about a minute your site is live at an address ending in `.pages.dev`.

## 3. Turn on live results (You vs AI)

The live results use a small free Cloudflare database (D1). The code is in `functions/api/stats.js`.
It stores only anonymous answer marks: no names, no IP addresses, no device information.

1. In the Cloudflare dashboard, open **Storage & Databases → D1 SQL database** and click **Create Database**.
   Name it `math-quiz` and click **Create**.
2. Open **Workers & Pages**, click your Pages project, then **Settings → Bindings → Add → D1 database**.
   - Variable name: `DB` (exactly, in capitals)
   - D1 database: `math-quiz`
   - Save.
3. Upload the files to GitHub (next section). The new deployment picks up the database automatically.
4. Check it: open the site, go to **You vs AI**. "No one has shared their answers yet" means it works.
   "Live results aren't available right now" means the binding is missing: check step 2, then in
   **Deployments** click the three dots on the latest one and choose **Retry deployment**.

**To clear test results** (for example before the showcase): open the `math-quiz` database, go to **Console**,
paste this and run it:

```
DELETE FROM answers; DELETE FROM plays;
```

**To download everything collected**, run these in the Console and use the download button:

```
SELECT * FROM plays;
SELECT * FROM answers;
```

## Files in the repository

```
index.html
README.md
functions/
  api/
    stats.js
```

`functions` must sit at the top level of the repository, next to `index.html`.

## Updating the site later
Upload a new `index.html` to the same GitHub repository (or edit it there). Cloudflare redeploys automatically.

## Backup for the exhibit
Keep a copy of `index.html` on the presentation laptop or a USB drive. It opens in any browser without internet.
