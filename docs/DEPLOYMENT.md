# Deployment

## Live site

The game is published at <https://yuksekalim.github.io/BlackJackGame/> from the public repository [`yuksekalim/BlackJackGame`](https://github.com/yuksekalim/BlackJackGame). GitHub Pages serves the root of the `gh-pages` branch.

The game source stays on `codex/blackjack-mvp`. The `gh-pages` branch contains only the generated site and a `.nojekyll` marker.

## Publish an update

Build from the source checkout, then copy the generated files to a detached worktree of `gh-pages` and push the static output:

```sh
# Once, create a nearby worktree for the existing gh-pages branch.
git fetch origin gh-pages
git worktree add --detach ../blackjack-pages origin/gh-pages

# For each update, run from the source checkout.
npm ci
npm run build
git -C ../blackjack-pages pull --ff-only origin gh-pages
rsync -a --delete --exclude='.git' dist/ ../blackjack-pages/
touch ../blackjack-pages/.nojekyll
git -C ../blackjack-pages add --all
git -C ../blackjack-pages commit -m "Deploy Blackjack site"
git -C ../blackjack-pages push origin HEAD:gh-pages
```

The production Vite base is `/BlackJackGame/`. Remotion static files use the same base through `src/main.tsx`, so card artwork and dealer sprites resolve from the project URL. Allow GitHub Pages a short time to publish after the push.
