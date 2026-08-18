import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicShareSchema, type PublicShare } from "@stavya/contracts";

/**
 * Public shared-result page — the landing target of every shared card.
 * Displays ONLY the approved minimal fields (score, profile, journey)
 * and drives the social growth loop back into the journey.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const WEB_ORIGIN =
  process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000";

const getShare = cache(async (publicId: string): Promise<PublicShare | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/share/${publicId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const parsed = PublicShareSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
});

interface PageProps {
  params: Promise<{ journeySlug: string; publicId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { journeySlug, publicId } = await params;
  const share = await getShare(publicId);
  if (!share) return { title: "Stavya Awareness Platform" };
  const canonical = `${WEB_ORIGIN}/share/${journeySlug}/${publicId}`;
  return {
    title: share.meta.title,
    description: share.meta.description,
    alternates: { canonical },
    openGraph: {
      title: share.meta.title,
      description: share.meta.description,
      url: canonical,
      siteName: "Stavya Awareness Platform",
      images: [{ url: share.cards.landscape, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: share.meta.title,
      description: share.meta.description,
      images: [share.cards.landscape],
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { publicId } = await params;
  const share = await getShare(publicId);
  if (!share) notFound();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-surface px-5 py-10 overflow-hidden">
      {/* Background aurora */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-float-a absolute -top-24 -left-20 size-96 rounded-full bg-brand-soft/70 blur-3xl" />
        <div className="animate-float-b absolute top-1/3 -right-24 size-100 rounded-full bg-aha-soft/70 blur-3xl" />
      </div>

      <div className="animate-fade-up relative z-10 flex w-full max-w-md flex-col items-center gap-6 rounded-card glass-panel p-8 text-center shadow-lift border border-white/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/stavya-logo.png"
          alt="Stavya Spine Hospital"
          className="h-10 w-auto"
        />
        <p className="text-sm font-black uppercase tracking-widest text-brand">
          {share.journeyName}
        </p>
        <div className="h-1 w-16 rounded-full bg-linear-to-r from-brand to-correct" />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ink-faint">
            Awareness Score
          </p>
          <p className="mt-1 text-7xl font-black text-brand-deep tracking-tight">
            {share.score}
            <span className="text-3xl font-bold text-ink-faint">
              /{share.total}
            </span>
          </p>
        </div>
        <span className="rounded-full border-2 border-brand/30 bg-brand-soft/50 px-6 py-2 text-sm font-extrabold uppercase tracking-wider text-brand shadow-soft">
          {share.profile}
        </span>
        <p className="text-base text-ink-soft italic font-medium">&ldquo;{share.tagline}&rdquo;</p>
        <Link
          href={`/j/${share.journeySlug}`}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-control bg-linear-to-r from-brand to-brand-deep text-base font-extrabold text-white shadow-glow transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <span>{share.cta}</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <p className="relative z-10 mt-6 max-w-md text-center text-xs leading-relaxed text-ink-faint">
        This is an educational awareness experience by Stavya Spine Hospital,
        not a medical diagnosis or clinical risk assessment.
      </p>
    </main>
  );
}

