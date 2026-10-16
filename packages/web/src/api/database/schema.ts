import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * FitDraw — état synchronisé entre appareils.
 *
 * L'appareil reste la source rapide (localStorage) ; ces tables ne servent qu'à
 * retrouver ses croquis sur un autre appareil. `updatedAt` arbitre les conflits :
 * la version la plus récente gagne, par vêtement.
 */

/** Un brouillon de croquis par (utilisateur, vêtement). */
export const drafts = sqliteTable(
  "drafts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    garmentId: text("garment_id").notNull(),
    /** Mesures en cm — `undefined` = champ vide. */
    values: text("values", { mode: "json" })
      .$type<Record<string, number | undefined>>()
      .notNull()
      .default({}),
    size: text("size"),
    coupe: text("coupe").notNull().default("droit"),
    updatedAt: integer("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [
    uniqueIndex("drafts_user_garment_idx").on(t.userId, t.garmentId),
    index("drafts_user_idx").on(t.userId),
  ],
);

/** Identité de la boutique (nom, logo, filigrane) — une ligne par utilisateur. */
export const branding = sqliteTable("branding", {
  userId: text("user_id").primaryKey(),
  shopName: text("shop_name").notNull().default(""),
  logoDataUrl: text("logo_data_url").notNull().default(""),
  showWatermark: integer("show_watermark", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});

/** Compteur d'usage par vêtement — sert à trier le sélecteur. */
export const usage = sqliteTable(
  "usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    garmentId: text("garment_id").notNull(),
    count: integer("count").notNull().default(0),
    lastUsed: integer("last_used", { mode: "number" }).notNull(),
  },
  (t) => [uniqueIndex("usage_user_garment_idx").on(t.userId, t.garmentId)],
);

export * from "./auth-schema";
