"use client";

import { useState } from "react";
import type { CreateShareResponse } from "@stavya/contracts";
import { cn } from "@/lib/cn";
import { ContinueButton } from "./ContinueButton";

/**
 * Explicit result sharing: prominent Share button → native share sheet →
 * single combined WhatsApp message + status share links + card download.
 */
export function ShareResult({
  create,
}: {
  create: () => Promise<CreateShareResponse>;
}) {
  const [share, setShare] = useState<CreateShareResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const ensureShare = async (): Promise<CreateShareResponse | null> => {
    if (share) return share;
    try {
      const created = await create();
      setShare(created);
      return created;
    } catch {
      setError(true);
      return null;
    }
  };

  const combinedShareText = share
    ? `${share.caption}\n\n👇 View my Spine & Bone Health Snapshot Card:\n${share.shareUrl}`
    : "";

  const nativeShare = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const s = await ensureShare();
      if (!s) return;
      const combinedText = `${s.caption}\n\n👇 View my Spine & Bone Health Snapshot Card:\n${s.shareUrl}`;

      try {
        const response = await fetch(s.cards.square);
        const blob = await response.blob();
        const file = new File([blob], "stavya-score-card.png", {
          type: "image/png",
        });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Stavya Spine Awareness Snapshot",
            text: combinedText,
          });
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Stavya Spine Awareness Snapshot",
            text: combinedText,
            url: s.shareUrl,
          });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }
      setOpen(true); // show fallback sheet
    } finally {
      setBusy(false);
    }
  };

  const moreOptions = async () => {
    setError(false);
    const s = await ensureShare();
    if (s) setOpen(true);
  };

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setError(true);
    }
  };

  const linkButton =
    "flex items-center justify-center gap-1.5 rounded-control border border-brand/15 bg-card px-3 py-3 text-xs sm:text-sm font-extrabold text-ink shadow-soft transition-all hover:border-brand/40 hover:bg-brand-soft/30 active:scale-[0.97]";

  return (
    <div className="animate-fade-up flex flex-col gap-3">
      <ContinueButton busy={busy} onClick={() => void nativeShare()}>
        📲 Share Combined Score Card & Link
      </ContinueButton>
      {!open ? (
        <button
          type="button"
          onClick={() => void moreOptions()}
          className="text-center text-xs sm:text-sm font-extrabold text-brand hover:underline underline-offset-2"
        >
          ⚡ More WhatsApp & Status Sharing Options
        </button>
      ) : null}
      {error ? (
        <p className="text-center text-xs sm:text-sm font-medium text-discover">
          Sharing didn&rsquo;t work just now — please try again.
        </p>
      ) : null}

      {open && share ? (
        <div className="animate-pop-in flex flex-col gap-3.5 rounded-card border border-brand/20 bg-brand-soft/40 p-4 sm:p-5 shadow-soft">
          <p className="text-center text-xs font-black uppercase tracking-wider text-brand">
            WhatsApp &amp; Social Status Sharing
          </p>

          {/* Quick Direct WhatsApp Combined Share */}
          <a
            className="flex h-13 w-full items-center justify-center gap-2 rounded-control bg-[#25D366] px-4 text-sm sm:text-base font-extrabold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98]"
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(combinedShareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Share directly to WhatsApp Chat &amp; Status
          </a>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              className={linkButton}
              href={`https://t.me/share/url?url=${encodeURIComponent(share.shareUrl)}&text=${encodeURIComponent(share.caption)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ✈️ Telegram
            </a>
            <a
              className={linkButton}
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(combinedShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              🐦 X (Twitter)
            </a>
            <a
              className={linkButton}
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(share.shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              💼 LinkedIn
            </a>
            <a
              className={linkButton}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share.shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              📘 Facebook
            </a>
            <a
              className={linkButton}
              href={share.cards.square}
              download="stavya-bone-health-card.png"
              target="_blank"
              rel="noopener noreferrer"
            >
              🖼️ Square Card
            </a>
            <a
              className={linkButton}
              href={share.cards.story}
              download="stavya-status-card.png"
              target="_blank"
              rel="noopener noreferrer"
            >
              📲 Story Card
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              className={cn(linkButton, "w-full text-brand")}
              onClick={() => void copy("combined", combinedShareText)}
            >
              {copied === "combined" ? "Combined Text Copied! ✓" : "📋 Copy Full Message & Link"}
            </button>
            <button
              type="button"
              className={cn(linkButton, "w-full")}
              onClick={() => void copy("link", share.shareUrl)}
            >
              {copied === "link" ? "Link Copied! ✓" : "🔗 Copy Link Only"}
            </button>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-ink-faint">
            Your card contains your awareness score &amp; journey profile. Never your contact details.
          </p>
        </div>
      ) : null}
    </div>
  );
}


