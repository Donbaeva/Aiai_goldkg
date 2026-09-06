import React, { useEffect, useState } from 'react';
import {
  HERO_FALLBACK_IMAGE,
  HERO_IMAGE_CANDIDATES,
  HERO_VIDEO_CANDIDATES,
} from '../config';

type ResolvedMedia =
  | { kind: 'video'; src: string }
  | { kind: 'image'; src: string };

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return false;
    const type = (res.headers.get('content-type') || '').toLowerCase();
    // Vite may fall through to HTML for missing files on some setups
    if (type.includes('text/html')) return false;
    return true;
  } catch {
    return false;
  }
}

/** Resolves /public/hero cover — video preferred, then image, then fallback. */
export function useHeroMedia(): ResolvedMedia {
  const [media, setMedia] = useState<ResolvedMedia>({
    kind: 'image',
    src: HERO_FALLBACK_IMAGE,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const src of HERO_VIDEO_CANDIDATES) {
        if (await probe(src)) {
          if (!cancelled) setMedia({ kind: 'video', src });
          return;
        }
      }
      for (const src of HERO_IMAGE_CANDIDATES) {
        if (await probe(src)) {
          if (!cancelled) setMedia({ kind: 'image', src });
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return media;
}

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  videoClassName?: string;
}

/** Renders image or autoplaying muted video ( product/category media). */
export const MediaFrame: React.FC<MediaFrameProps> = ({
  src,
  alt,
  className = '',
  videoClassName,
}) => {
  const isVideo =
    src.startsWith('data:video') || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(src);

  if (isVideo) {
    return (
      <video
        src={src}
        className={videoClassName || className}
        muted
        loop
        autoPlay
        playsInline
        aria-label={alt}
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
};
