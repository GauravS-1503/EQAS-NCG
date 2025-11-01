# QAP-NCG (Clean Static Site)

This is a cleaned, deploy-ready version of your site for GitHub Pages.

## Structure

- `index.html` — landing page at repository root (required by GitHub Pages)
- `assets/css/` — stylesheets
- `assets/js/` — scripts
- `assets/img/` — images/icons
- `pages/` — any extra HTML pages copied from your original project

> Your original project had `index.html` inside a `public/` folder. GitHub Pages expects `index.html` at the repository root (unless you use a build step). This clean layout fixes that.

## How to publish on GitHub Pages

1. Create a new public repository on GitHub (e.g. `QAP-NCG`).
2. Initialize locally and push:

   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial clean publish"
   git remote add origin https://github.com/<your-username>/QAP-NCG.git
   git push -u origin main
   ```

3. In GitHub → **Settings** → **Pages**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `/ (root)`
   - Save. Your site will build and be available at the Pages URL.

## Notes

- If you later add a bundler (Vite, Parcel, etc.), keep Pages pointed to the built output folder (`/docs` or `/dist`) or use GitHub Actions.
- Secrets (.env) and bulky folders like `node_modules` are ignored by default via `.gitignore`.
