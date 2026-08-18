"use client";

import { useEffect, useRef, useState } from "react";
import {
  RecognitionActionResponseSchema,
  type DisplayNameChoiceValue,
  type RecognitionState,
} from "@stavya/contracts";
import { apiFetch, getApiBaseUrl } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { ContinueButton } from "./ContinueButton";
import { OptionListSelector } from "./OptionListSelector";

/**
 * 6/6 recognition flow (approved doc §13). Copy is verbatim. Stages:
 * perfect-score consent → selfie capture → preview → display preview →
 * publish → confirmation. Declining leaves the report untouched.
 */
export function RecognitionFlow({
  sessionId,
  initial,
}: {
  sessionId: string;
  initial: RecognitionState;
}) {
  const [state, setState] = useState<RecognitionState>(initial);
  // Local sub-stage within ELIGIBLE: capture → preview → display
  const [stage, setStage] = useState<"capture" | "preview" | "display">(
    initial.hasSelfie ? "display" : "capture",
  );
  const [consentChecked, setConsentChecked] = useState(false);
  const [choice, setChoice] = useState<DisplayNameChoiceValue>();
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (localPhoto) URL.revokeObjectURL(localPhoto);
    },
    [localPhoto],
  );

  const submitConsent = async (granted: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch(
        `/sessions/${sessionId}/recognition/consent`,
        RecognitionActionResponseSchema,
        {
          method: "POST",
          body: granted
            ? { granted, displayNameChoice: choice ?? "first-name" }
            : { granted },
        },
      );
      setState(result.recognition);
      setStage("capture");
    } catch {
      setError("That didn't work — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onPhotoPicked = (file: File | undefined) => {
    if (!file) return;
    if (localPhoto) URL.revokeObjectURL(localPhoto);
    setPendingFile(file);
    setLocalPhoto(URL.createObjectURL(file));
    setStage("preview");
  };

  const uploadPhoto = async () => {
    if (!pendingFile) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("photo", pendingFile, "selfie.jpg");
      const response = await fetch(
        `${getApiBaseUrl()}/api/sessions/${sessionId}/recognition/selfie`,
        { method: "POST", body: form },
      );
      if (!response.ok) throw new Error();
      const parsed = RecognitionActionResponseSchema.safeParse(
        await response.json(),
      );
      if (!parsed.success) throw new Error();
      setState(parsed.data.recognition);
      setStage("display");
    } catch {
      setError("Upload failed — please try another photo.");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch(
        `/sessions/${sessionId}/recognition/publish`,
        RecognitionActionResponseSchema,
        { method: "POST" },
      );
      setState(result.recognition);
    } catch {
      setError("Publishing failed — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const card = "animate-fade-up rounded-card bg-card p-5 shadow-soft";
  const heading = "text-lg font-extrabold leading-snug text-brand-deep";

  // ---------- COMPLETED: on the screen ----------
  if (state.status === "COMPLETED") {
    return (
      <div className={cn(card, "text-center")}>
        <p className="text-3xl" aria-hidden>
          🎉
        </p>
        <h3 className={heading}>YOU&rsquo;RE ON THE SCREEN!</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your 6/6 moment is now part of the Stavya Spine Awareness
          experience. Look up at the OPD screens—you might spot yourself! 👀
        </p>
        {state.displayName ? (
          <p className="mt-3 text-sm font-bold text-brand">
            Displayed as: {state.displayName}
          </p>
        ) : null}
      </div>
    );
  }

  // ---------- DECLINED: quiet confirmation ----------
  if (state.status === "DECLINED") {
    return (
      <div className={card}>
        <p className="text-sm leading-relaxed text-ink-soft">
          No problem — your report and score remain available either way.
        </p>
      </div>
    );
  }

  // ---------- PENDING: perfect score consent ----------
  if (state.status === "PENDING") {
    return (
      <div className={card}>
        <h3 className={heading}>YOU GOT 6/6! 🎉</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          That&rsquo;s a perfect score. Would you like to celebrate it with
          the Stavya community? If you choose Yes, we&rsquo;ll invite you to
          take a selfie and display your photo, selected display name and
          6/6 achievement on the Stavya OPD display screens.
        </p>
        <p className="mt-2 text-sm font-semibold text-ink">
          Your mobile number, email address and other contact details will
          never be displayed.
        </p>
        <div className="mt-4">
          <ConsentCheckbox checked={consentChecked} onChange={setConsentChecked}>
            Yes, I&rsquo;d like to be featured on the Stavya OPD display
            screens with my photo and 6/6 score.
          </ConsentCheckbox>
        </div>
        {consentChecked ? (
          <div className="mt-3">
            <p className="text-sm font-bold text-ink">
              How should your name appear?
            </p>
            <OptionListSelector
              className="mt-2"
              ariaLabel="Display name"
              value={choice}
              onChange={(v) => setChoice(v as DisplayNameChoiceValue)}
              options={[
                { value: "first-name", label: "First name" },
                { value: "initial", label: "Initials only" },
                { value: "anonymous", label: "Anonymous" },
              ]}
            />
          </div>
        ) : null}
        <p className="mt-3 text-xs text-ink-faint">
          You can choose not to participate. Your report and score will
          remain available either way.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ContinueButton
            busy={busy}
            disabled={consentChecked && !choice}
            onClick={() => void submitConsent(consentChecked)}
          >
            Continue
          </ContinueButton>
        </div>
        {error ? <p className="mt-2 text-sm text-discover">{error}</p> : null}
      </div>
    );
  }

  // ---------- ELIGIBLE: selfie capture / preview / display preview ----------
  return (
    <div className={card}>
      {stage === "capture" ? (
        <>
          <h3 className={heading}>YOU NAILED IT. NOW MAKE IT YOURS. 📸</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Take a quick selfie to celebrate your perfect score. Your photo
            will appear on the Stavya OPD display with your display name +
            6/6 achievement.
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            Privacy reminder: Your contact details will not appear on the
            display.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => onPhotoPicked(e.target.files?.[0])}
          />
          <div className="mt-4">
            <ContinueButton onClick={() => fileInput.current?.click()}>
              Take My Selfie
            </ContinueButton>
          </div>
        </>
      ) : null}

      {stage === "preview" && localPhoto ? (
        <>
          <h3 className={heading}>LOOKS GOOD?</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localPhoto}
            alt="Your selfie preview"
            className="mt-3 aspect-square w-full rounded-card object-cover"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="h-13 flex-1 rounded-control bg-brand-soft text-[15px] font-bold text-brand"
              onClick={() => {
                setStage("capture");
                setTimeout(() => fileInput.current?.click(), 50);
              }}
            >
              Retake
            </button>
            <ContinueButton
              className="flex-1"
              busy={busy}
              onClick={() => void uploadPhoto()}
            >
              Use This Photo
            </ContinueButton>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => onPhotoPicked(e.target.files?.[0])}
          />
        </>
      ) : null}

      {stage === "display" ? (
        <>
          <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-brand">
            Display preview
          </p>
          <div className="mt-3 flex flex-col items-center gap-3 rounded-card bg-brand-deep p-6 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Stavya Spine Awareness
            </p>
            <p className="text-4xl font-extrabold">6 / 6</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                localPhoto ??
                `${getApiBaseUrl()}/api/sessions/${sessionId}/recognition/selfie`
              }
              alt="Your selfie"
              className="size-36 rounded-full border-4 border-white/30 object-cover"
            />
            <p className="text-lg font-bold">{state.displayName ?? ""}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-aha">
              Bone Health Champion
            </p>
            <p className="text-xs text-white/70">
              Celebrating a perfect score in the Healthy Bones Journey
            </p>
            <p className="text-xs text-white/50">
              Think you can beat the score? Scan to take the Healthy Bones
              Journey.
            </p>
          </div>
          <div className="mt-4">
            <ContinueButton busy={busy} onClick={() => void publish()}>
              Put Me On The Screen
            </ContinueButton>
          </div>
          <button
            type="button"
            className="mt-2 w-full text-center text-sm font-semibold text-brand underline underline-offset-2"
            onClick={() => {
              setStage("capture");
              setTimeout(() => fileInput.current?.click(), 50);
            }}
          >
            Retake photo
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => onPhotoPicked(e.target.files?.[0])}
          />
        </>
      ) : null}
      {error ? <p className="mt-2 text-sm text-discover">{error}</p> : null}
    </div>
  );
}
