import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authed } from "../middleware/auth";

/** Historique d'usage par vêtement — trie le sélecteur du plus utilisé au moins utilisé. */
export const usage = {
  list: authed.handler(({ context }) =>
    db.select().from(schema.usage).where(eq(schema.usage.userId, context.user.id)),
  ),

  bump: authed
    .input(z.object({ garmentId: z.string().min(1).max(40), at: z.number().optional() }))
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const at = input.at ?? Date.now();
      const [row] = await db
        .insert(schema.usage)
        .values({ id: crypto.randomUUID(), userId, garmentId: input.garmentId, count: 1, lastUsed: at })
        .onConflictDoUpdate({
          target: [schema.usage.userId, schema.usage.garmentId],
          set: { count: sql`${schema.usage.count} + 1`, lastUsed: at },
        })
        .returning();
      return row;
    }),
};
