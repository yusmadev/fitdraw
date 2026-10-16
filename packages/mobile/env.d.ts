// Le client API typé de l'app mobile importe `AppRouterClient` depuis `@template/web`,
// ce qui fait entrer les modules serveur du paquet web dans le programme TypeScript mobile.
// `packages/mobile/__env.d.ts` (géré par le template) ne déclare que les variables Expo :
// on complète ici les clés serveur lues par `packages/web/src/api`, sans toucher au fichier `__`.
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    WEBSITE_URL?: string;
    DATABASE_URL?: string;
    DATABASE_AUTH_TOKEN?: string;
    BETTER_AUTH_SECRET?: string;
    APPLICATION_ID?: string;
    VITE_APPLICATION_ID?: string;
    VITE_RUNABLE_AUTH_ISSUER?: string;
    VITE_WEBSITE_URL?: string;
    S3_ENDPOINT?: string;
    S3_BUCKET?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
  }
}
