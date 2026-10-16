import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authed } from "../middleware/auth";

const measureValues = z.record(z.string(), z.number().positive().optional());

const draftInput = z.object({
  garmentId: z.string().min(1).max(40),
  values: measureValues,
  size: z.string().max(8).nullable(),
  coupe: z.string().max(12),
  updatedAt: z.number(),
});

/** Brouillons de croquis — un par vêtement, la version la plus récente gagne. */
export const drafts = {
  list: authed.handler(({ context }) =>
    db.select().from(schema.drafts).where(eq(schema.drafts.userId, context.user.id)),
  ),

  upsert: authed.input(draftInput).handler(async ({ input, context }) => {
    const userId = context.user.id;
    const [existing] = await db
      .select()
      .from(schema.drafts)
      .where(and(eq(schema.drafts.userId, userId), eq(schema.drafts.garmentId, input.garmentId)));

    // Ne jamais écraser une version plus récente déjà sur le serveur.
    if (existing && existing.updatedAt > input.updatedAt) return existing;

    if (existing) {
      const [row] = await db
        .update(schema.drafts)
        .set({ values: input.values, size: input.size, coupe: input.coupe, updatedAt: input.updatedAt })
        .where(eq(schema.drafts.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await db
      .insert(schema.drafts)
      .values({
        id: crypto.randomUUID(),
        userId,
        garmentId: input.garmentId,
        values: input.values,
        size: input.size,
        coupe: input.coupe,
        updatedAt: input.updatedAt,
      })
      .returning();
    return row;
  }),

  remove: authed.input(z.object({ garmentId: z.string().min(1) })).handler(async ({ input, context }) => {
    await db
      .delete(schema.drafts)
      .where(and(eq(schema.drafts.userId, context.user.id), eq(schema.drafts.garmentId, input.garmentId)));
    return { ok: true };
  }),
};
