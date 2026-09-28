# Deployment

## Live site

The game is published at <https://yuksekalim.github.io/BlackJackGame/> from the public source repository [`yuksekalim/BlackJackGame`](https://github.com/yuksekalim/BlackJackGame).

## Automatic deployment

The GitHub Actions workflow at `.github/workflows/pages.yml` builds the app and deploys `dist/` to GitHub Pages when changes reach `codex/blackjack-mvp`.

The Vite production base path is `/BlackJackGame/`. `src/main.tsx` applies the same base to Remotion `staticFile()` URLs, so bundled card SVGs and dealer sprites resolve beneath the project URL.

## One-time GitHub Pages setup

In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. After that, pushes to `codex/blackjack-mvp` publish the latest game automatically.

## Verify a deployment

Open the Actions tab and confirm the **Deploy to GitHub Pages** run succeeds. Then open the live URL and check that the first hand displays the card faces and dealer artwork.
