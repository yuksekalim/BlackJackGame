# Deployment

The source repository stays private. The built browser game is published to the separate public repository [`yuksekalim/BlackJackGame-Pages`](https://github.com/yuksekalim/BlackJackGame-Pages) at <https://yuksekalim.github.io/BlackJackGame-Pages/>. Only the generated contents of `dist/` belong in that public repository; do not copy the source tree, project documents, or Git history there.

The Vite base path is `/BlackJackGame-Pages/`, which makes bundled card artwork load from the project page. `src/main.tsx` gives Remotion's `staticFile()` the same base so the dealer sprites also load correctly.

Clone the Pages repository once alongside this private checkout:

```sh
git clone git@github.com:yuksekalim/BlackJackGame-Pages.git ../BlackJackGame-Pages
```

To publish a later update, run from the source checkout:

```sh
npm run build
git -C ../BlackJackGame-Pages pull --ff-only
rsync -a --delete --exclude='.git' dist/ ../BlackJackGame-Pages/
touch ../BlackJackGame-Pages/.nojekyll
git -C ../BlackJackGame-Pages add --all
git -C ../BlackJackGame-Pages commit -m "Deploy Blackjack site"
git -C ../BlackJackGame-Pages push
```

The Pages repository's `main` branch, root folder is the publishing source. Give deployment a short time to finish after pushing; the site URL stays the same.
