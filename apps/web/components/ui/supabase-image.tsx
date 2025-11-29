"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";

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
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		console.log("[SupabaseImage] useEffect start", { bucketName, path, expiry, fallback });

		if (!path) {
			console.log("[SupabaseImage] no path provided, using fallback", { fallback });
			setSrc(fallback);
			return;
		}

		const supabase = createClient();

		(async () => {
			try {
	                const { data: signedData, error: signedErr } = await supabase.storage
					.from(bucketName)
					.createSignedUrl(path as string, expiry);

				if (signedErr || !signedData?.signedUrl) {
					const msg = (signedErr as any)?.message ?? "No se pudo obtener la URL de la imagen";
					setError(msg);
					if (mounted) {
						setSrc(fallback);
					}
					return;
				}

				// Optional: try to fetch the signed URL to get HTTP status for debugging
				const signedUrl = signedData.signedUrl;
				try {
					const resp = await fetch(signedUrl, { method: "GET" });
					console.log("[SupabaseImage] fetch(signedUrl) status", resp.status, resp.ok);
				} catch (fetchErr) {
					console.warn("[SupabaseImage] fetch(signedUrl) failed (CORS or network)", fetchErr);
				}

				if (mounted) {
					setSrc(signedUrl);
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setError(msg);
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

