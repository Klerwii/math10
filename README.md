# Is Math Biased? — AI vs Human Error Analyser

A MATH+AI Futures project for MATH 10.

**Big Question:** Is math biased? Can the formula we choose decide whether AI or humans come out on top?

The website is one file, `index.html`. It needs no installation, no build step and no server. Everything, including
any data loaded on the Research Data tab, runs inside the visitor's own browser and is never uploaded.

## Before publishing

On the **Start here** tab, edit:
- **About this project:** replace `[Member 1]`, `[Section]`, `[School]` and `[Instructor's name]`.
- **AI use disclosure:** state exactly what your group did and which AI tools you used.

You can edit these directly on GitHub: open `index.html`, click the pencil icon, use Ctrl+F to find the brackets,
then click **Commit changes**. Cloudflare updates the live site automatically within a minute or two.

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

## Updating the site later
Upload a new `index.html` to the same GitHub repository (or edit it there). Cloudflare redeploys automatically.

## Backup for the exhibit
Keep a copy of `index.html` on the presentation laptop or a USB drive. It opens in any browser without internet.
