/**
 * Create the `medical_images` storage bucket and its RLS policies so the
 * diagnosis flow can upload retinal images and the UI can read them via signed
 * URLs.
 *
 * Storage in Supabase is plain Postgres (storage.buckets + storage.objects with
 * RLS), so this is created via SQL using the app's DB connection — the standard
 * Supabase migration approach, and the only option here because the Storage
 * admin API key (SUPABASE_SECRET_KEY) is stale.
 *
 * Idempotent: re-running upserts the bucket and recreates the policies.
 *
 * Usage: pnpm --filter web seed:storage
 */
import { sql } from "drizzle-orm";
import { db, queryClient } from "../client";

const BUCKET = "medical_images";
const FILE_SIZE_LIMIT = 52428800; // 50 MiB (matches lib/supabase/storage.ts + config.toml)
const MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/bmp",
  "image/tiff",
  "image/webp",
];

const ACTIONS = ["select", "insert", "update", "delete"] as const;

async function finish(code: number): Promise<never> {
  await queryClient.end({ timeout: 5 }).catch(() => {});
  process.exit(code);
}

async function main() {
  // 1. Bucket (private; signed-URL reads).
  const mimeArrayLiteral = `{${MIME_TYPES.join(",")}}`;
  await db.execute(sql`
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (${BUCKET}, ${BUCKET}, false, ${FILE_SIZE_LIMIT}, ${mimeArrayLiteral}::text[])
    on conflict (id) do update
      set file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types
  `);
  console.log(`✓ bucket ensured: ${BUCKET} (private, ${FILE_SIZE_LIMIT} bytes)`);

  // 2. RLS policies on storage.objects scoped to this bucket, for authenticated
  //    users. INSERT needs WITH CHECK; the rest use USING. Idempotent via drop.
  // DDL can't bind parameters (Postgres can't infer their type in CREATE
  // POLICY), so inline the bucket id as a literal. Both values are fixed,
  // controlled constants — no injection surface.
  const cond = `bucket_id = '${BUCKET}'`;
  for (const action of ACTIONS) {
    const name = `${BUCKET}_authenticated_${action}`;
    await db.execute(
      sql.raw(`drop policy if exists "${name}" on storage.objects`),
    );

    let ddl: string;
    if (action === "insert") {
      ddl = `create policy "${name}" on storage.objects for insert to authenticated with check (${cond})`;
    } else if (action === "update") {
      ddl = `create policy "${name}" on storage.objects for update to authenticated using (${cond}) with check (${cond})`;
    } else {
      ddl = `create policy "${name}" on storage.objects for ${action} to authenticated using (${cond})`;
    }
    await db.execute(sql.raw(ddl));
    console.log(`✓ policy ensured: ${name}`);
  }

  console.log(`✓ storage ready for bucket "${BUCKET}"`);
  return finish(0);
}

main().catch((e) => {
  console.error("seed:storage failed:", e);
  return finish(1);
});
