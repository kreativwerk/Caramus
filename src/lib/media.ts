import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "exercise-media";
export const DOCS_BUCKET = "patient-docs";
export const FEEDBACK_BUCKET = "feedback-media";

async function signedUrl(supabase: SupabaseClient, bucket: string, path: string) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/**
 * Übungsmedien können entweder ein externer Link (http…) oder ein Pfad im
 * privaten Storage-Bucket sein. Bucket-Pfade werden über eine zeitlich
 * begrenzte signierte URL ausgeliefert.
 */
export async function resolveMediaUrl(
  supabase: SupabaseClient,
  mediaUrl: string | null
): Promise<string | null> {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) return mediaUrl;
  return signedUrl(supabase, MEDIA_BUCKET, mediaUrl);
}

/** Signierte URL für ein Patientendokument (Rezept, Überweisung …). */
export async function resolveDocumentUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string | null> {
  return signedUrl(supabase, DOCS_BUCKET, filePath);
}

/** Signierte URL für einen Screenshot aus einer Rückmeldung. */
export async function resolveFeedbackUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string | null> {
  return signedUrl(supabase, FEEDBACK_BUCKET, filePath);
}
