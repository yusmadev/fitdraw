import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authed } from "../middleware/auth";

const brandingInput = z.object({
  shopName: z.string().max(32),
  logoDataUrl: z.string().max(350_000),
  showWatermark: z.boolean(),
  updatedAt: z.number(),
});

/** Identité de la boutique, une ligne par utilisateur. */
export const branding = {
  get: authed.handler(async ({ context }) => {
    const [row] = await db.select().from(schema.branding).where(eq(schema.branding.userId, context.user.id));
    return row ?? null;
  }),

  upsert: authed.input(brandingInput).handler(async ({ input, context }) => {
    const userId = context.user.id;
    const [row] = await db
      .insert(schema.branding)
      .values({
        userId,
        shopName: input.shopName,
        logoDataUrl: input.logoDataUrl,
        showWatermark: input.showWatermark,
        updatedAt: input.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.branding.userId,
        set: {
          shopName: input.shopName,
          logoDataUrl: input.logoDataUrl,
          showWatermark: input.showWatermark,
          updatedAt: input.updatedAt,
        },
      })
      .returning();
    return row;
  }),
};
