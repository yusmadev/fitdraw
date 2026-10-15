# FitDraw

FitDraw permet de créer des croquis de mesures de vêtements, puis de les copier, partager ou exporter en PNG 1600 × 1600. Les mesures, préférences et personnalisations sont enregistrées dans le stockage local du navigateur : aucun compte, OAuth ou serveur de données n’est utilisé.

## Démarrer en local

Prérequis : Node.js 20 ou supérieur et npm.

```sh
npm ci
npm run dev
```

Vite sert l’application à <http://localhost:3000>.

## Vérifications et build

```sh
npm run check
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` génère le site statique dans `dist/public`. `npm run preview` sert le résultat de production à <http://localhost:4173>.

## Publication

Publiez le **contenu de `dist/public/`** sur un hébergeur statique (par exemple Cloudflare Pages, Netlify, Vercel Static ou GitHub Pages) avec la commande de build `npm ci && npm run build` et le répertoire de sortie `dist/public`.

Les routes inconnues doivent retomber sur `/index.html` (fallback SPA). Pour Cloudflare Pages, la présence de `public/_redirects` configure ce fallback. La PWA est activée en HTTPS ou localhost ; le Service Worker n’est pas disponible depuis une origine HTTP non sécurisée.

## Données locales

Les brouillons par vêtement, l’unité, le thème, le vêtement récent, l’historique d’utilisation et le nom/logo de boutique restent dans le navigateur courant. Ils ne sont ni synchronisés entre appareils ni téléversés. Le logo personnalisé accepte PNG, JPG ou WebP jusqu’à 1 Mo et est redimensionné dans le navigateur.
