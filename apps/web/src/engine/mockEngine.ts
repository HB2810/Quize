import type {
  AnswerEvaluation,
  ContactRequest,
  CreateShareResponse,
  StepPayload,
  SubmitStepRequest,
  SubmitStepResponse,
} from "@stavya/contracts";

interface MockSession {
  sessionId: string;
  stepIndex: number;
  ageRange?: string;
  gender?: string;
  answers: Record<string, { optionKey: string; wasCorrect: boolean }>;
  contact?: ContactRequest;
}

const sessions: Record<string, MockSession> = {};

const MOCK_QUESTIONS = [
  {
    key: "Q1",
    topic: "Bone Basics",
    text: "If your bones had a bank account, what would you want to be doing in your 20s & 30s?",
    options: [
      { key: "A", label: "Building the balance with activity & nutrition" },
      { key: "B", label: "Ignoring it until I get older" },
      { key: "C", label: "Only thinking about it after an injury" },
      { key: "D", label: "I am not sure" },
    ],
    correct: "A",
    aha: "Your bones are living tissue and are continuously remodelled throughout your life.",
    takeaway: "Building strong bone habits early gives your skeleton a solid bank balance.",
  },
  {
    key: "Q2",
    topic: "Nutrition",
    text: "Which combination is most effective for building long-term strong bones?",
    options: [
      { key: "A", label: "Calcium supplements alone" },
      { key: "B", label: "Vitamin D alone" },
      { key: "C", label: "Good nutrition + physical activity + healthy lifestyle" },
      { key: "D", label: "Avoiding physical exercise" },
    ],
    correct: "C",
    aha: "Bone health is influenced by nutrition, Vitamin D, movement, and muscle loading working together.",
    takeaway: "Think bones + muscles + movement, not just calcium.",
  },
  {
    key: "Q3",
    topic: "Movement & Strength",
    text: "What has the strongest physical connection with your bones?",
    options: [
      { key: "A", label: "Muscle and bone work completely independently" },
      { key: "B", label: "Strong muscles and regular loading support healthy bones" },
      { key: "C", label: "Only body weight matters" },
      { key: "D", label: "Only calcium supplements matter" },
    ],
    correct: "B",
    aha: "Bone and muscle are closely connected. When muscles pull on bone during resistance exercise, bones adapt by staying dense.",
    takeaway: "Building strength isn't just about appearance—it gives your skeleton a reason to stay strong.",
  },
  {
    key: "Q4",
    topic: "Bone Density & Pain",
    text: "True or False: If your bones don't hurt, they are guaranteed to be 100% healthy?",
    options: [
      { key: "A", label: "True — pain is always the first sign" },
      { key: "B", label: "False — bone loss occurs silently without pain" },
    ],
    correct: "B",
    aha: "Bone density loss happens silently over years without pain or obvious warning signals.",
    takeaway: "No pain does not equal a full clinical bill of health. Awareness starts before symptoms appear.",
  },
  {
    key: "Q5",
    topic: "Prevention & Lifestyle",
    text: "Which habit can quietly work against long-term bone health?",
    options: [
      { key: "A", label: "Regular strength and balance training" },
      { key: "B", label: "Smoking and prolonged sedentary desk work" },
      { key: "C", label: "Eating a balanced, nutrient-rich diet" },
      { key: "D", label: "Getting adequate sunlight and Vitamin D" },
    ],
    correct: "B",
    aha: "Smoking and prolonged sedentary lifestyle are major recognised risk factors for accelerated bone loss.",
    takeaway: "Good bone health is as much about what you avoid as what you do.",
  },
  {
    key: "Q6",
    topic: "Long-term Independence",
    text: "What is the ultimate real-world goal of keeping your bones and spine healthy?",
    options: [
      { key: "A", label: "Never having a single ache" },
      { key: "B", label: "Staying mobile, active, and independent throughout life" },
      { key: "C", label: "Taking calcium pills forever" },
      { key: "D", label: "Avoiding all physical activity" },
    ],
    correct: "B",
    aha: "Strong bones support your mobility, balance, and independence to keep doing what you love.",
    takeaway: "Strong bones equal strong independence.",
  },
];

function buildStep(session: MockSession): StepPayload {
  const index = session.stepIndex;

  if (index === 0) {
    return {
      type: "LANGUAGE_SELECT",
      title: "LET'S MAKE THIS JOURNEY YOURS.",
      body: "Your spine and bones do a lot for you every day. Let's see how much you know about them—and uncover a few things you may not expect.",
      prompt: "Select your language:",
      cta: "Let's Begin",
      options: [
        { value: "en", label: "English" },
        { value: "hi", label: "Hindi", hint: "हिन्दी" },
        { value: "gu", label: "Gujarati", hint: "ગુજરાતી" },
      ],
    };
  }

  if (index === 1) {
    return {
      type: "DEMOGRAPHIC",
      key: "ageRange",
      title: "FIRST, TELL US A LITTLE ABOUT YOURSELF.",
      body: "Your answers will help us make the journey more relevant to your stage of life.",
      prompt: "Which age group are you in?",
      cta: "Continue",
      options: [
        { value: "18-25", label: "18–25" },
        { value: "26-35", label: "26–35" },
        { value: "36-45", label: "36–45" },
        { value: "46-55", label: "46–55" },
        { value: "56-65", label: "56–65" },
        { value: "66+", label: "66+" },
      ],
    };
  }

  if (index === 2) {
    return {
      type: "DEMOGRAPHIC",
      key: "gender",
      title: "ONE MORE THING.",
      body: "Some aspects of bone health change differently across life stages. We'll use this to personalize your experience.",
      prompt: "Select your gender:",
      cta: "Continue",
      options: [
        { value: "female", label: "Female" },
        { value: "male", label: "Male" },
        { value: "prefer-not-to-say", label: "Prefer not to say" },
      ],
    };
  }

  if (index === 3) {
    return {
      type: "INTRO",
      title: "HOW WELL DO YOU KNOW YOUR BONES? 🦴",
      body: [
        "You probably know that calcium is important.",
        "But here's the thing: Bone health is much more interesting than calcium.",
        "Your bones are living tissue. They change throughout your life—and what influences them isn't always what you'd expect.",
        "Over the next few questions, we'll separate a few facts from common assumptions.",
      ],
      cta: "Show Me",
    };
  }

  if (index >= 4 && index <= 9) {
    const qIndex = index - 4;
    const q = MOCK_QUESTIONS[qIndex] ?? MOCK_QUESTIONS[0];
    return {
      type: "QUESTION",
      questionKey: q.key,
      topic: q.topic,
      text: q.text,
      options: q.options,
      progress: { current: qIndex + 1, total: 6 },
    };
  }

  if (index === 10) {
    return {
      type: "REPORT_TEASER",
      title: "YOU'VE MADE IT TO THE END. 🦴",
      body: "You've just answered 6 questions about your spine and bone health. And along the way, you probably discovered a few things you didn't know. Now let's see what your answers say about you.",
      teaser:
        "Your Bone Awareness Score & Personalised Snapshot are ready to unlock!",
      bullets: [
        "🦴 Your Bone Awareness Score — how many of the 6 concepts you already knew.",
        "💡 Your Discovery Score — the things you didn't know before today.",
        "🔎 Your Awareness Map — where your understanding is strongest and where there is more to explore.",
        "✨ Your Personalised Insights — based on your age, gender and actual answers.",
        "👨‍⚕️ A Stavya Specialist's Perspective — a relevant insight to put your result into context.",
      ],
      cta: "Create My Snapshot",
    };
  }

  if (index === 11) {
    return {
      type: "CONTACT",
      title: "ALMOST THERE.",
      body: "Your answers are saved. We just need a few details to create and deliver your personalised Spine & Bone Health Snapshot.",
      consentText:
        "I agree to receive my Spine & Bone Health Snapshot and relevant communication from Stavya Spine Hospital.",
      cta: "Reveal My Snapshot",
    };
  }

  // Report step
  const answersList = Object.values(session.answers);
  const correctCount = answersList.filter((a) => a.wasCorrect).length;
  const discoveryCount = 6 - correctCount;

  let profile = "Bone Health Champion";
  if (correctCount <= 1) profile = "Just Getting Started";
  else if (correctCount <= 3) profile = "Curious Learner";
  else if (correctCount <= 4) profile = "Bone Aware";
  else if (correctCount === 5) profile = "Bone Smart";

  return {
    type: "REPORT",
    report: {
      title: "MY SPINE & BONE HEALTH SNAPSHOT",
      headline: `You scored ${correctCount}/6 in your awareness journey!`,
      opening:
        "Today's journey uncovered plenty of useful insights about your spine and bone health. Knowledge is your best asset for long-term mobility and independence.",
      awareness: { score: correctCount, total: 6 },
      profile,
      lifeStage: session.ageRange ?? "Adult",
      discovery: {
        count: discoveryCount,
        statement:
          discoveryCount > 0
            ? `You discovered ${discoveryCount} new key concept${discoveryCount > 1 ? "s" : ""} today!`
            : "Perfect score! You knew all 6 key concepts.",
        isBonus: correctCount === 6,
        bonus:
          correctCount === 6
            ? "Bonus Fact: Regular resistance training helps stimulate bone mineral density at any age."
            : undefined,
      },
      awarenessMap: MOCK_QUESTIONS.map((q) => {
        const ans = session.answers[q.key];
        return {
          topic: q.topic,
          status: ans?.wasCorrect ? "strong" : "explore",
        };
      }),
      whatThisMeans:
        "Your snapshot provides insights to help you build healthy daily habits for lifelong skeletal health.",
      genderInsight:
        "Bone and muscle health are connected across all life stages. Nutrition, weight-bearing exercise, and Vitamin D support long-term mobility.",
      worthKnowing:
        "Think of bone health as a long-term investment in mobility, independence, and doing what you love.",
      doctorQuote:
        "“Bone health is a lifelong journey. The goal is not simply strong bones, but the strength and confidence to keep doing what you love.” — Stavya Spine Specialist",
      cta: "Explore More About Spine & Bone Health",
      footer:
        "This is an educational awareness experience by Stavya Spine Hospital, not a medical diagnosis or clinical risk assessment.",
    },
    recognitionEligible: true,
    recognition: { eligible: true, status: "PENDING" },
  };
}

export function createMockSession(): { sessionId: string; step: StepPayload } {
  const sessionId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const session: MockSession = { sessionId, stepIndex: 0, answers: {} };
  sessions[sessionId] = session;
  return { sessionId, step: buildStep(session) };
}

export function getMockStep(sessionId: string): { sessionId: string; step: StepPayload } {
  let session = sessions[sessionId];
  if (!session) {
    const res = createMockSession();
    return res;
  }
  return { sessionId, step: buildStep(session) };
}

export function submitMockStep(
  sessionId: string,
  body: SubmitStepRequest,
): SubmitStepResponse {
  let session = sessions[sessionId];
  if (!session) {
    const res = createMockSession();
    session = sessions[res.sessionId];
  }

  let evaluation: AnswerEvaluation | undefined = undefined;

  if (body.type === "DEMOGRAPHIC") {
    if (body.key === "ageRange") session.ageRange = body.value;
    if (body.key === "gender") session.gender = body.value;
  }

  if (body.type === "QUESTION") {
    const qIndex = session.stepIndex - 4;
    const q = MOCK_QUESTIONS[qIndex];
    const wasCorrect = q ? body.optionKey === q.correct : false;

    if (q) {
      session.answers[q.key] = { optionKey: body.optionKey, wasCorrect };
      evaluation = {
        wasCorrect,
        correctOptionKey: q.correct,
        ahaMoment: q.aha,
        takeaway: q.takeaway,
      };
    }
  }

  session.stepIndex += 1;
  const nextStep = buildStep(session);

  return {
    sessionId: session.sessionId,
    step: nextStep,
    evaluation,
  };
}

export function submitMockContact(
  sessionId: string,
  body: ContactRequest,
): SubmitStepResponse {
  let session = sessions[sessionId];
  if (!session) {
    const res = createMockSession();
    session = sessions[res.sessionId];
  }
  session.contact = body;
  session.stepIndex += 1;
  return {
    sessionId: session.sessionId,
    step: buildStep(session),
  };
}

export function createMockShare(sessionId: string): CreateShareResponse {
  const session = sessions[sessionId];
  const answersList = Object.values(session?.answers ?? {});
  const correctCount = answersList.filter((a) => a.wasCorrect).length;
  const publicId = `share-${Date.now()}`;

  let profile = "Bone Health Champion";
  if (correctCount <= 1) profile = "Just Getting Started";
  else if (correctCount <= 3) profile = "Curious Learner";
  else if (correctCount <= 4) profile = "Bone Aware";
  else if (correctCount === 5) profile = "Bone Smart";

  return {
    publicId,
    shareUrl: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/share/healthy-bones/${publicId}`,
    cards: {
      landscape: "/brand/stavya-logo.png",
      square: "/brand/stavya-logo.png",
    },
    caption: `I scored ${correctCount}/6 on Stavya's Healthy Bones Journey!\nTake the journey:`,
    meta: {
      title: `I scored ${correctCount}/6 on Stavya's Healthy Bones Journey`,
      description: "How well do you know your bones? Take the awareness journey.",
    },
  };
}
