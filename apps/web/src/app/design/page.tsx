"use client";

/**
 * Design-system showcase — development only (404s in production).
 * Demonstrates every journey component with sample content so the look
 * and motion can be reviewed before journey logic exists. Sample text
 * here is placeholder ONLY — real content comes from the approved
 * Healthy Bones document in Foundation 6.
 */

import { notFound } from "next/navigation";
import { useState } from "react";
import { AhaMoment } from "@/components/journey/AhaMoment";
import { AnswerFeedback } from "@/components/journey/AnswerFeedback";
import { AnswerOption } from "@/components/journey/AnswerOption";
import { ConsentCheckbox } from "@/components/journey/ConsentCheckbox";
import { ContinueButton } from "@/components/journey/ContinueButton";
import { DiscoveryCard } from "@/components/journey/DiscoveryCard";
import { JourneyShell } from "@/components/journey/JourneyShell";
import { OptionListSelector } from "@/components/journey/OptionListSelector";
import { ProgressIndicator } from "@/components/journey/ProgressIndicator";
import { QuestionCard } from "@/components/journey/QuestionCard";
import { ReportSection } from "@/components/journey/ReportSection";
import { ScoreReveal } from "@/components/journey/ScoreReveal";
import { Takeaway } from "@/components/journey/Takeaway";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-brand/10 py-8">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function DesignShowcasePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [selected, setSelected] = useState<string>();
  const [answered, setAnswered] = useState(false);
  const [language, setLanguage] = useState<string>();
  const [consentA, setConsentA] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);

  return (
    <JourneyShell progress={{ current: 3, total: 6 }}>
      <h1 className="text-2xl font-bold">Design system</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Sample content only — approved journey content arrives in
        Foundation 6.
      </p>

      <Section title="Question + answers (interactive)">
        <QuestionCard topic="Sample topic" question="Which option is this demo's correct answer?">
          {["A", "B", "C"].map((key) => (
            <AnswerOption
              key={key}
              optionKey={key}
              label={`Sample option ${key}`}
              state={
                answered
                  ? key === "B"
                    ? "correct"
                    : key === selected
                      ? "incorrect"
                      : "disabled"
                  : key === selected
                    ? "selected"
                    : "idle"
              }
              onSelect={() => setSelected(key)}
            />
          ))}
        </QuestionCard>
        <ContinueButton
          disabled={!selected}
          onClick={() => setAnswered(true)}
        >
          {answered ? "Answered" : "Check answer"}
        </ContinueButton>
        {answered ? (
          <button
            type="button"
            className="text-sm font-semibold text-brand underline"
            onClick={() => {
              setAnswered(false);
              setSelected(undefined);
            }}
          >
            Reset demo
          </button>
        ) : null}
      </Section>

      {answered ? (
        <Section title="Feedback sequence">
          <AnswerFeedback
            kind={selected === "B" ? "correct" : "incorrect"}
            message="Sample educational feedback text explaining the answer."
          />
          <AhaMoment>
            Sample Aha Moment — the surprising fact that makes someone say
            &ldquo;I didn&rsquo;t know that.&rdquo;
          </AhaMoment>
          <Takeaway>
            Sample takeaway — the one sentence worth remembering.
          </Takeaway>
        </Section>
      ) : null}

      <Section title="Score reveal">
        <div key={scoreKey}>
          <ScoreReveal score={5} total={6} />
        </div>
        <DiscoveryCard count={1} />
        <button
          type="button"
          className="text-sm font-semibold text-brand underline"
          onClick={() => setScoreKey((k) => k + 1)}
        >
          Replay animation
        </button>
      </Section>

      <Section title="Context selection (language / demographics)">
        <OptionListSelector
          ariaLabel="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "en", label: "English" },
            { value: "hi", label: "Hindi", hint: "हिन्दी" },
            { value: "gu", label: "Gujarati", hint: "ગુજરાતી" },
          ]}
        />
      </Section>

      <Section title="Consent">
        <ConsentCheckbox checked={consentA} onChange={setConsentA}>
          Sample communication consent wording. Separate from recognition
          consent, always.
        </ConsentCheckbox>
      </Section>

      <Section title="Report section">
        <ReportSection title="Your strengths">
          Sample report content assembled by the report engine from the
          journey template and session data.
        </ReportSection>
      </Section>

      <Section title="Progress variants">
        <ProgressIndicator current={1} total={6} />
        <ProgressIndicator current={4} total={6} />
        <ProgressIndicator current={6} total={6} />
      </Section>

      <Section title="Loading & error states">
        <LoadingState />
        <ErrorState onRetry={() => undefined} />
      </Section>
    </JourneyShell>
  );
}
