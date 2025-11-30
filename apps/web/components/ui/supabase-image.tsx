"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";

// Cache for signed URLs to avoid regenerating them
// Key: `${bucketName}/${path}`, Value: { url, expiresAt }
const urlCache = new Map<string, { url: string; expiresAt: number }>();

interface SupabaseImageProps {
  width: number;
  height: number;
  bucketName: string;
  path: string;
  alt?: string;
  className?: string;
  quality?: number;
  /** If true, Next.js image optimization is disabled (useful for remote URLs) */
  unoptimized?: boolean;
  /** Signed URL expiry in seconds (used if public URL isn't available) */
  expiry?: number;
  fallback?: string;
}

/**
 * SupabaseImage
 * - Cliente React ("use client") que obtiene la URL de una imagen almacenada
 *   en Supabase Storage y la renderiza usando `next/image`.
 * - Intenta obtener la `publicUrl` primero; si no existe, crea una signed URL.
 * - Cachea las signed URLs para evitar descargas repetidas.
 */
export default function SupabaseImage({
  width,
  height,
  bucketName,
  path,
  alt = "",
  className,
  quality = 75,
  unoptimized = true,
  expiry = 600,
  fallback = "file.svg",
}: SupabaseImageProps) {
  const [src, setSrc] = useState<string>(fallback);

  useEffect(() => {
    let mounted = true;

    console.log("[SupabaseImage] useEffect start", {
      bucketName,
      path,
      expiry,
      fallback,
    });

    // Async function to handle all state updates
    (async () => {
      // No path provided
      if (!path) {
        console.log("[SupabaseImage] no path provided, using fallback", {
          fallback,
        });
        if (mounted) {
          setSrc(fallback);
        }
        return;
      }

      // Check cache first
      const cacheKey = `${bucketName}/${path}`;
      const cached = urlCache.get(cacheKey);
      const now = Date.now();

      if (cached && cached.expiresAt > now) {
        console.log("[SupabaseImage] using cached URL", { cacheKey });
        if (mounted) {
          setSrc(cached.url);
        }
        return;
      }

      // Fetch new signed URL
      const supabase = createClient();

      try {
        const { data: signedData, error: signedErr } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(path as string, expiry);

        if (signedErr || !signedData?.signedUrl) {
          const msg =
            signedErr?.message ?? "No se pudo obtener la URL de la imagen";
          console.error("[SupabaseImage] Error:", msg);
          if (mounted) {
            setSrc(fallback);
          }
          return;
        }

        const signedUrl = signedData.signedUrl;

        // Cache the signed URL with expiration time
        // Subtract 60 seconds as a safety buffer to avoid using expired URLs
        const expiresAt = now + (expiry - 60) * 1000;
        urlCache.set(cacheKey, { url: signedUrl, expiresAt });
        console.log("[SupabaseImage] cached new URL", { cacheKey, expiresAt });

        if (mounted) {
          setSrc(signedUrl);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[SupabaseImage] Error:", msg);
        if (mounted) {
          setSrc(fallback);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bucketName, path, expiry, fallback]);

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      quality={quality}
      unoptimized={unoptimized}
    />
  );
}
