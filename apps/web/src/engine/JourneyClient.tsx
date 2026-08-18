"use client";

import { useState } from "react";
import type { StepPayload } from "@stavya/contracts";
import { AhaMoment } from "@/components/journey/AhaMoment";
import { AnswerFeedback } from "@/components/journey/AnswerFeedback";
import { AnswerOption } from "@/components/journey/AnswerOption";
import { ConsentCheckbox } from "@/components/journey/ConsentCheckbox";
import { ContinueButton } from "@/components/journey/ContinueButton";
import { DiscoveryCard } from "@/components/journey/DiscoveryCard";
import { JourneyShell } from "@/components/journey/JourneyShell";
import { OptionListSelector } from "@/components/journey/OptionListSelector";
import { QuestionCard } from "@/components/journey/QuestionCard";
import { ReportSection } from "@/components/journey/ReportSection";
import { ScoreReveal } from "@/components/journey/ScoreReveal";
import { RecognitionFlow } from "@/components/journey/RecognitionFlow";
import { ShareResult } from "@/components/journey/ShareResult";
import { Takeaway } from "@/components/journey/Takeaway";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useJourney } from "./useJourney";
import { cn } from "@/lib/cn";
import { FeedbackModal } from "@/components/journey/FeedbackModal";

// Stavya Spine Journey UI additions
import { LanguageCard } from "@/components/stavya/LanguageCard";
import { PrimaryButton } from "@/components/stavya/PrimaryButton";
import { ScoreCircle } from "@/components/stavya/ScoreCircle";
import { ConfettiEffect } from "@/components/stavya/ConfettiEffect";
import { ScratchCard } from "@/components/stavya/ScratchCard";
import { LANGUAGE_META, type Lang } from "@/lib/i18n";

export function JourneyClient({ slug }: { slug: string }) {
  const journey = useJourney(slug);
  const { state } = journey;

  if (state.phase === "loading") {
    return (
      <JourneyShell>
        <LoadingState label="Preparing your journey…" />
      </JourneyShell>
    );
  }

  if (state.phase === "error") {
    return (
      <JourneyShell>
        <div className="flex flex-1 items-center">
          <ErrorState message={state.message} onRetry={journey.retry} />
        </div>
      </JourneyShell>
    );
  }

  const { step } = state;
  const progress =
    step.type === "QUESTION"
      ? { current: step.progress.current, total: step.progress.total }
      : undefined;

  return (
    <JourneyShell progress={progress}>
      <StepView key={stepIdentity(step)} journey={journey} />
    </JourneyShell>
  );
}

/** Stable identity per step so each new step remounts with its entrance animation. */
function stepIdentity(step: StepPayload): string {
  return step.type === "QUESTION" ? `Q-${step.questionKey}` : step.type;
}

function StepView({ journey }: { journey: ReturnType<typeof useJourney> }) {
  const { state } = journey;
  if (state.phase !== "step") return null;
  const { step, busy, evaluation, answeredOptionKey } = state;

  switch (step.type) {
    case "LANGUAGE_SELECT":
    case "DEMOGRAPHIC":
      return <SelectStep journey={journey} />;
    case "INTRO":
      return (
        <div className="animate-step-in flex flex-1 flex-col justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/spine-unit-small.png"
              alt=""
              aria-hidden
              className="animate-float-slow mx-auto mb-3 h-20 w-auto drop-shadow-md"
            />
            <StepHeading title={step.title} />
            <div className="mt-3 flex flex-col gap-2.5">
              {step.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="animate-fade-up rounded-3xl glass-panel p-4 text-sm sm:text-base leading-relaxed text-muted-foreground shadow-soft"
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-2">
            <PrimaryButton
              fullWidth
              disabled={busy}
              onClick={() => void journey.submit({ type: "INTRO" })}
            >
              {step.cta}
            </PrimaryButton>
          </div>
        </div>
      );
    case "QUESTION":
      return (
        <QuestionStep
          journey={journey}
          answered={Boolean(evaluation)}
          answeredOptionKey={answeredOptionKey}
        />
      );
    case "REPORT_TEASER":
      return (
        <div className="animate-step-in flex flex-1 flex-col justify-between">
          <div>
            <StepHeading title={step.title} />
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <div className="animate-pop-in relative mt-4 overflow-hidden rounded-3xl bg-amber-500/10 p-5 border border-amber-500/30 shadow-soft">
              <div aria-hidden className="shine-sweep animate-shine absolute inset-0 opacity-80" />
              <p className="relative text-sm sm:text-base font-bold leading-relaxed text-foreground">
                {step.teaser}
              </p>
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {step.bullets.map((bullet, i) => (
                <li
                  key={i}
                  className="animate-fade-up rounded-2xl glass-panel p-4 text-xs sm:text-sm font-semibold text-muted-foreground shadow-soft"
                  style={{ animationDelay: `${200 + i * 90}ms` }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-2">
            <PrimaryButton
              fullWidth
              disabled={busy}
              onClick={() => void journey.submit({ type: "REPORT_TEASER" })}
            >
              {step.cta}
            </PrimaryButton>
          </div>
        </div>
      );
    case "CONTACT":
      return <ContactStep journey={journey} />;
    case "REPORT":
      return <ReportStep journey={journey} />;
  }
}

function StepHeading({ title }: { title: string }) {
  return (
    <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight text-foreground">
      {title}
    </h1>
  );
}

function SelectStep({ journey }: { journey: ReturnType<typeof useJourney> }) {
  const { state } = journey;
  const [value, setValue] = useState<string>();
  if (state.phase !== "step") return null;
  const step = state.step;
  if (step.type !== "LANGUAGE_SELECT" && step.type !== "DEMOGRAPHIC")
    return null;

  const submit = () => {
    if (!value) return;
    if (step.type === "LANGUAGE_SELECT") {
      void journey.submit({ type: "LANGUAGE_SELECT", language: value });
    } else {
      void journey.submit({ type: "DEMOGRAPHIC", key: step.key, value });
    }
  };

  if (step.type === "LANGUAGE_SELECT") {
    return (
      <div className="animate-step-in flex flex-1 flex-col justify-between">
        <div>
          <StepHeading title={step.title} />
          <p className="mt-2 text-base text-muted-foreground">{step.body}</p>

          <div className="mt-6 space-y-3">
            {LANGUAGE_META.map((l, i) => (
              <LanguageCard
                key={l.code}
                native={l.native}
                label={l.label}
                sample={l.sample}
                index={i}
                active={value === l.code}
                onSelect={() => {
                  setValue(l.code);
                  void journey.submit({ type: "LANGUAGE_SELECT", language: l.code });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-step-in flex flex-1 flex-col justify-between">
      <div>
        <StepHeading title={step.title} />
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <p className="mt-5 text-sm font-extrabold text-foreground">{step.prompt}</p>
        <OptionListSelector
          className="mt-3"
          ariaLabel={step.prompt}
          options={step.options}
          value={value}
          onChange={setValue}
        />
      </div>
      <div className="mt-6 pt-2">
        <PrimaryButton fullWidth disabled={!value || state.busy} onClick={submit}>
          {step.cta}
        </PrimaryButton>
      </div>
    </div>
  );
}

function QuestionStep({
  journey,
  answered,
  answeredOptionKey,
}: {
  journey: ReturnType<typeof useJourney>;
  answered: boolean;
  answeredOptionKey?: string;
}) {
  const { state } = journey;
  const [pendingKey, setPendingKey] = useState<string>();
  if (state.phase !== "step" || state.step.type !== "QUESTION") return null;
  const step = state.step;
  const evaluation = state.evaluation;
  const chosenKey = answeredOptionKey ?? pendingKey;

  const optionState = (key: string) => {
    if (!answered) return key === chosenKey && state.busy ? "selected" : "idle";
    if (key === evaluation?.correctOptionKey) return "correct";
    if (key === chosenKey) return "incorrect";
    return "disabled";
  };

  return (
    <div className="flex flex-1 flex-col justify-between">
      <QuestionCard topic={step.topic} question={step.text}>
        {step.options.map((option, index) => (
          <AnswerOption
            key={option.key}
            optionKey={option.key}
            label={option.label}
            index={index}
            state={optionState(option.key)}
            onSelect={
              answered || state.busy
                ? undefined
                : () => {
                    setPendingKey(option.key);
                    void journey.submit({
                      type: "QUESTION",
                      questionKey: step.questionKey,
                      optionKey: option.key,
                    });
                  }
            }
          />
        ))}
      </QuestionCard>

      {/* Pop-Up Modal Overlay for zero scrolling feedback */}
      {answered && evaluation ? (
        <FeedbackModal
          wasCorrect={evaluation.wasCorrect}
          message={
            evaluation.wasCorrect
              ? "Your instinct was right on this one!"
              : `The correct answer: ${
                  step.options.find(
                    (o) => o.key === evaluation.correctOptionKey,
                  )?.label ?? ""
                }`
          }
          ahaMoment={evaluation.ahaMoment}
          takeaway={evaluation.takeaway}
          onContinue={journey.continueAfterAnswer}
        />
      ) : null}
    </div>
  );
}

function ContactStep({ journey }: { journey: ReturnType<typeof useJourney> }) {
  const { state } = journey;
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  if (state.phase !== "step" || state.step.type !== "CONTACT") return null;
  const step = state.step;

  const nameOk = name.trim().length > 0;
  const mobileOk = /^[6-9]\d{9}$/.test(mobile.trim());
  const emailOk = email.trim() === "" || /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = nameOk && mobileOk && emailOk && consent;

  const fieldClass = (ok: boolean) =>
    cn(
      "h-14 w-full rounded-2xl border-2 bg-card px-5 text-base font-semibold text-foreground shadow-soft outline-none transition-all duration-200",
      "placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:ring-4 focus:ring-ring/20",
      touched && !ok ? "border-red-500/50 bg-red-500/5" : "border-border",
    );

  const handleSubmit = () => {
    setTouched(true);
    if (!valid) return;
    void journey.submitContact({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() === "" ? undefined : email.trim(),
      consentCommunication: true,
    });
  };

  return (
    <div className="animate-fade-up flex flex-1 flex-col justify-between">
      <div>
        <StepHeading title={step.title} />
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <input
            className={fieldClass(nameOk)}
            placeholder="Enter your full name *"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={fieldClass(mobileOk)}
            placeholder="Enter mobile number *"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          />
          <input
            className={fieldClass(emailOk)}
            placeholder="Enter email address (optional)"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ConsentCheckbox checked={consent} onChange={setConsent}>
            {step.consentText}
          </ConsentCheckbox>
          {touched && !valid ? (
            <p className="text-xs font-bold text-red-500">
              Please enter your name, valid 10-digit mobile number, and check consent.
            </p>
          ) : null}
          <div className="pt-2">
            <PrimaryButton
              fullWidth
              disabled={touched && !valid}
              onClick={handleSubmit}
            >
              {step.cta}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportStep({ journey }: { journey: ReturnType<typeof useJourney> }) {
  const { state } = journey;
  const [showScratch, setShowScratch] = useState(false);
  if (state.phase !== "step" || state.step.type !== "REPORT") return null;
  const { report, recognitionEligible } = state.step;

  const scorePct = Math.round((report.awareness.score / report.awareness.total) * 100);

  if (showScratch) {
    return (
      <ScratchCard
        lang="en"
        score={scorePct}
        onComplete={() => setShowScratch(false)}
      />
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-5 pb-6">
      <ConfettiEffect />

      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
          {report.title}
        </p>
        <StepHeading title={report.headline} />
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {report.opening}
        </p>
      </div>

      {/* Prominent Score Card with ScoreCircle */}
      <div className="rounded-4xl border border-glass-border bg-card p-6 shadow-card text-center">
        <ScoreCircle score={scorePct} label={report.profile} />
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Life Stage: <span className="text-primary">{report.lifeStage}</span>
        </p>

        {/* Claim Prize CTA button */}
        <div className="mt-6">
          <PrimaryButton
            variant="accent"
            fullWidth
            onClick={() => setShowScratch(true)}
            className="shadow-glow"
          >
            Collect Your Prize 🎁
          </PrimaryButton>
        </div>
      </div>

      <ShareResult create={journey.createShare} />

      {/* Discovery Summary */}
      {report.discovery.isBonus ? (
        <ReportSection title="Bonus discovery" delay={150}>
          <p>{report.discovery.statement}</p>
          {report.discovery.bonus ? (
            <p className="mt-2 font-semibold text-primary">{report.discovery.bonus}</p>
          ) : null}
        </ReportSection>
      ) : (
        <>
          <DiscoveryCard count={report.discovery.count} />
          <ReportSection title="Your discovery score" delay={200}>
            <p>{report.discovery.statement}</p>
          </ReportSection>
        </>
      )}

      {/* Awareness Map */}
      <ReportSection title="Your awareness map" delay={300}>
        <div className="flex flex-wrap gap-2">
          {report.awarenessMap.map((entry) => (
            <span
              key={entry.topic}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-soft",
                entry.status === "strong"
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-600 border border-amber-500/30",
              )}
            >
              {entry.status === "strong" ? "✓ " : "✨ "}
              {entry.topic}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">
          ✓ Strong understanding &bull; ✨ Discovery potential
        </p>
      </ReportSection>

      <ReportSection title="What this means" delay={400}>
        <p>{report.whatThisMeans}</p>
      </ReportSection>

      <ReportSection title="Worth knowing at your life stage" delay={500}>
        <p>{report.genderInsight}</p>
        <p className="mt-2">{report.worthKnowing}</p>
      </ReportSection>

      <ReportSection title="From a Stavya spine specialist" delay={600}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🩺</span>
          <p className="italic font-medium text-muted-foreground">{report.doctorQuote}</p>
        </div>
      </ReportSection>

      {recognitionEligible && state.step.recognition && journey.sessionId ? (
        <RecognitionFlow
          sessionId={journey.sessionId}
          initial={state.step.recognition}
        />
      ) : null}

      <div className="mt-4">
        <PrimaryButton
          variant="outline"
          fullWidth
          onClick={journey.restart}
        >
          🔄 Retake This Journey
        </PrimaryButton>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-center">
        {report.footer}
      </p>
    </div>
  );
}
