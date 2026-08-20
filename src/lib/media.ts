import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "exercise-media";

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
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(mediaUrl, 60 * 60);
  return data?.signedUrl ?? null;
}
