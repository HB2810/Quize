/**
 * Healthy Bones v1 content seed.
 *
 * ALL journey copy in this file is transcribed VERBATIM from the
 * approved sources in docs/content/:
 *  - STAVYA_Phase_2_Healthy_Bones_FINAL_6Q_Implementation_Document.docx
 *  - STAVYA_Phase_2_Healthy_Bones_Standard_Report_Variations.xlsx
 * Do not edit copy here without content-team approval.
 *
 * Documented content decisions (pending content-team confirmation):
 *  - Neutral route ("Prefer not to say") serves the M-variant Q3/Q5 as
 *    the universal alternatives, since the document requires universal
 *    alternatives but provides no separate neutral copy. The M variants
 *    are general-knowledge phrasings that do not address the
 *    participant's own gender.
 *  - The 6/6 "Bonus Discovery" uses the approved gender-route insight
 *    as its content, since no separate bonus-fact copy was provided.
 *  - Languages: only English is seeded. Hindi/Gujarati appear in the
 *    language step once approved translations are supplied.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FOOTER =
  "This is an educational awareness experience, not a medical diagnosis or clinical risk assessment. Your responses cannot determine whether you have osteoporosis or another medical condition.";

const AGE_OPTIONS = [
  { value: "18-25", label: "18–25" },
  { value: "26-35", label: "26–35" },
  { value: "36-45", label: "36–45" },
  { value: "46-55", label: "46–55" },
  { value: "56-65", label: "56–65" },
  { value: "66+", label: "66+" },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const FLOW_CONFIG = {
  steps: [
    {
      type: "LANGUAGE_SELECT",
      copy: {
        title: "LET'S MAKE THIS JOURNEY YOURS.",
        body: "Your spine and bones do a lot for you every day. Let's see how much you know about them—and uncover a few things you may not expect.",
        prompt: "Select your language:",
        cta: "Let's Begin",
      },
    },
    {
      type: "DEMOGRAPHIC",
      key: "ageRange",
      copy: {
        title: "FIRST, TELL US A LITTLE ABOUT YOURSELF.",
        body: "Your answers will help us make the journey more relevant to your stage of life.",
        prompt: "Which age group are you in?",
        cta: "Continue",
      },
      options: AGE_OPTIONS,
    },
    {
      type: "DEMOGRAPHIC",
      key: "gender",
      copy: {
        title: "ONE MORE THING.",
        body: "Some aspects of bone health change differently across life stages. We'll use this only to make a couple of questions more relevant to you.",
        prompt: "Select your gender:",
        cta: "Continue",
      },
      options: GENDER_OPTIONS,
    },
    {
      type: "INTRO",
      copy: {
        title: "HOW WELL DO YOU KNOW YOUR BONES? 🦴",
        body: [
          "You probably know that calcium is important.",
          "But here's the thing: Bone health is much more interesting than calcium.",
          "Your bones are living tissue. They change throughout your life—and what influences them isn't always what you'd expect.",
          "Over the next few questions, we'll separate a few facts from common assumptions.",
        ],
        cta: "Show Me",
      },
    },
    { type: "QUESTION", slot: 1 },
    { type: "QUESTION", slot: 2 },
    { type: "QUESTION", slot: 3 },
    { type: "QUESTION", slot: 4 },
    { type: "QUESTION", slot: 5 },
    { type: "QUESTION", slot: 6 },
    {
      type: "REPORT_TEASER",
      copy: {
        title: "YOU'VE MADE IT TO THE END. 🦴",
        body: "You've just answered 6 questions about your spine and bone health. And along the way, you probably discovered a few things you didn't know. Now let's see what your answers say about you.",
        bullets: [
          "🦴 Your Bone Awareness Score — how many of the 6 concepts you already knew.",
          "💡 Your Discovery Score — the things you didn't know before today.",
          "🔎 Your Awareness Map — where your understanding is strongest and where there is more to explore.",
          "✨ Your Personalised Insights — based on your age, gender and actual answers.",
          "👨‍⚕️ A Stavya Specialist's Perspective — a relevant insight to put your result into context.",
        ],
        cta: "Create My Snapshot",
      },
    },
    {
      type: "CONTACT",
      copy: {
        title: "ALMOST THERE.",
        body: "Your answers are saved. We just need a few details to create and deliver your personalised Spine & Bone Health Snapshot.",
        consentText:
          "I agree to receive my Spine & Bone Health Snapshot and relevant communication from Stavya Spine Hospital.",
        cta: "Reveal My Snapshot",
      },
    },
    { type: "REPORT" },
  ],
};

const SCORING_CONFIG = {
  strategy: "correct-count",
  totalQuestions: 6,
  profiles: [
    { min: 0, max: 1, profile: "Just Getting Started" },
    { min: 2, max: 3, profile: "Curious Learner" },
    { min: 4, max: 4, profile: "Bone Aware" },
    { min: 5, max: 5, profile: "Bone Smart" },
    { min: 6, max: 6, profile: "Bone Health Champion" },
  ],
};

// 21 standard reports = 7 score variations × 3 gender routes (xlsx).
const REPORT_TEMPLATE = {
  type: "standard-v1",
  title: "MY SPINE & BONE HEALTH SNAPSHOT",
  footer: FOOTER,
  cta: "Explore More About Spine & Bone Health",
  genderCopy: {
    female: {
      insight:
        "Your bone health is connected to your overall health across different life stages. Nutrition, movement, hormonal health and changes such as menopause can all become relevant at different points in life.",
      worthKnowing:
        "Pay attention to the bigger picture: adequate nutrition, regular movement and understanding how hormonal changes can influence bone health.",
      doctorQuote:
        "“Bone health is a lifelong journey. The goal is not simply strong bones, but the strength and confidence to keep doing what you love.” — Stavya Spine Specialist",
    },
    male: {
      insight:
        "Bone health is not only a women's health issue. Men can also experience bone loss and osteoporosis, while muscle strength, activity and healthy lifestyle choices remain important throughout life.",
      worthKnowing:
        "Think beyond calcium. Strength, movement, nutrition and awareness all contribute to long-term musculoskeletal health.",
      doctorQuote:
        "“Strong bones and strong muscles work together to support mobility and independence throughout life.” — Stavya Spine Specialist",
    },
    neutral: {
      insight:
        "Bone health is a lifelong process. Nutrition, movement, Vitamin D, strength and healthy lifestyle choices all contribute to keeping your bones working for you.",
      worthKnowing:
        "Think of bone health as a long-term investment in mobility, independence and the life you want to keep living.",
      doctorQuote:
        "“Bone health is about much more than a single number or nutrient. It is about protecting movement and independence for the long term.” — Stavya Spine Specialist",
    },
  },
  scoreCopy: {
    "0": {
      profile: "Just Getting Started",
      headline: "You came here curious—and that's a great place to start.",
      opening:
        "Today's journey uncovered plenty of things you may not have known about your bones. The good news? Bone health is something you can learn about and support at every stage of life.",
      whatThisMeans:
        "Your Snapshot is about discovery, not judgement. Start with the basics and build from there.",
      discoveryStatement:
        "You didn't get six things wrong. You discovered six things today. That's exactly what this journey was designed for.",
    },
    "1": {
      profile: "Just Getting Started",
      headline:
        "You've started the conversation. Now there's plenty more to discover.",
      opening:
        "You knew a little, but several answers revealed interesting gaps. Think of this as your starting point for understanding what helps keep your bones strong.",
      whatThisMeans:
        "Your Snapshot is about discovery, not judgement. Start with the basics and build from there.",
      discoveryStatement: "You discovered 5 new things about your bones.",
    },
    "2": {
      profile: "Curious Learner",
      headline:
        "You knew some of the basics—but your bones still had a few surprises for you.",
      opening:
        "You have some awareness of bone health, with several areas worth exploring further. A little more knowledge can go a long way when it comes to long-term health.",
      whatThisMeans:
        "You have some foundational awareness. There are several useful bone-health concepts you can explore further.",
      discoveryStatement: "You discovered 4 new things.",
    },
    "3": {
      profile: "Curious Learner",
      headline: "You've got the beginnings of a good bone-health foundation.",
      opening:
        "You knew about half of what we explored. That means you already have some useful knowledge—and now you know where there's more to discover.",
      whatThisMeans:
        "You have some foundational awareness. There are several useful bone-health concepts you can explore further.",
      discoveryStatement: "You discovered 3 new things.",
    },
    "4": {
      profile: "Bone Aware",
      headline: "You know your bone-health basics better than you might think.",
      opening:
        "You have a solid foundation across the concepts we explored. There are still a couple of areas worth knowing more about, but you're on a good track.",
      whatThisMeans:
        "You have a good foundation. A couple of areas are worth strengthening your understanding around.",
      discoveryStatement: "You discovered 2 new things.",
    },
    "5": {
      profile: "Bone Smart",
      headline: "You know your bone-health basics. There's just one surprise left.",
      opening:
        "You showed strong awareness across the journey. One or two concepts may still have caught you off guard—but overall, your bone-health awareness is strong.",
      whatThisMeans:
        "Your awareness is strong. Keep building on it with practical, long-term habits.",
      discoveryStatement: "You discovered 1 new thing.",
    },
    "6": {
      profile: "Bone Health Champion",
      headline: "6/6. Perfect score! 🎉",
      opening:
        "You knew every answer we tested. That's a great sign of bone-health awareness. But we're not stopping there—here's a bonus discovery we didn't test you on.",
      whatThisMeans:
        "You demonstrated excellent awareness. Your bonus discovery keeps the journey going.",
      discoveryStatement:
        "You knew all six. So here's a bonus fact we didn't test you on.",
    },
  },
  teasers: {
    "0": "Looks like your journey uncovered quite a few surprises. 👀 Your Snapshot will show you what you already knew—and the things you may want to know better.",
    "1": "Looks like your journey uncovered quite a few surprises. 👀 Your Snapshot will show you what you already knew—and the things you may want to know better.",
    "2": "You knew some of these—but a few answers may have surprised you. Your Snapshot will show you where your awareness is strongest and what you discovered today.",
    "3": "You knew some of these—but a few answers may have surprised you. Your Snapshot will show you where your awareness is strongest and what you discovered today.",
    "4": "You've got a good foundation. But we found a couple of interesting gaps. Your Snapshot will show you exactly where they are.",
    "5": "You know your bone-health basics. There's just one surprise waiting for you. 👀 Your Snapshot will show you what it was—and why it matters.",
    "6": "Perfect score. 🎉 You clearly know your bone-health basics. But we've still got one bonus discovery waiting for you.",
  },
};

// Sharing engine config — journey-configurable, never hard-coded into
// the generic engine. Brand per approved spec: #0056AC on white, Manrope.
const SHARE_CONFIG = {
  brand: {
    primary: "#0056AC",
    background: "#FFFFFF",
    wordmark: "STAVYA SPINE",
  },
  card: {
    scoreLabel: "YOUR AWARENESS SCORE",
    tagline: "How well do you know your bones?",
    cta: "Take the Healthy Bones Journey",
  },
  captionTemplate:
    "I scored {score}/{total} on Stavya's {journeyName} Journey.\n\nHow well do you know your bones?\n\nTake the journey:\n{url}",
  metaTitleTemplate:
    "I scored {score}/{total} on Stavya's {journeyName} Journey",
  metaDescription:
    "How well do you know your bones? Take the Healthy Bones awareness journey by Stavya Spine.",
};

interface QDef {
  key: string;
  slot: number;
  gender?: "F" | "M";
  topic: string;
  text: string;
  options: Array<[string, string]>;
  correct: string;
  aha: string;
  takeaway: string;
}

interface PathwayDef {
  key: string;
  name: string;
  questions: QDef[];
}

const PATHWAYS: PathwayDef[] = [
  {
    key: "18-25",
    name: "Build Your Bone Bank",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Basics",
        text: "If your bones had a bank account, what would you want to be doing in your 20s?",
        options: [["A", "Building the balance"], ["B", "Ignoring it until I'm older"], ["C", "Only thinking about it after an injury"], ["D", "I'm not sure"]],
        correct: "A",
        aha: "Your bones are living tissue and are continuously remodelled.",
        takeaway: "Your 20s are an excellent time to build healthy habits.",
      },
      {
        key: "Q2", slot: 2, topic: "Nutrition",
        text: "Which combination is most useful for building strong bones?",
        options: [["A", "Calcium alone"], ["B", "Vitamin D alone"], ["C", "Good nutrition + physical activity + healthy lifestyle"], ["D", "Avoiding exercise"]],
        correct: "C",
        aha: "Bone health is influenced by nutrition, Vitamin D, physical activity and other lifestyle factors.",
        takeaway: "Think bones + muscles + movement, not just calcium.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "Which statement about periods and bone health is most accurate?",
        options: [["A", "Menstrual health has nothing to do with overall bone health"], ["B", "Long-term disruption of menstrual function can sometimes be associated with lower bone health"], ["C", "Bone health only matters after menopause"], ["D", "Having periods automatically protects bones"]],
        correct: "B",
        aha: "Hormonal health is one part of the bigger bone-health picture.",
        takeaway: "Persistent menstrual disturbances should not simply be ignored.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Movement",
        text: "What has the strongest connection with your bones?",
        options: [["A", "Muscle and bone work independently"], ["B", "Strong muscles and regular loading can support healthy bones"], ["C", "Only body weight matters"], ["D", "Only calcium matters"]],
        correct: "B",
        aha: "Bone and muscle are closely connected.",
        takeaway: "Building strength isn't only about appearance—it also gives your skeleton a reason to adapt.",
      },
      {
        key: "Q4", slot: 4, topic: "Movement",
        text: "Which of these gives your bones a reason to stay strong?",
        options: [["A", "Sitting all day"], ["B", "Weight-bearing activity"], ["C", "Only stretching"], ["D", "Sleeping more"]],
        correct: "B",
        aha: "Bones respond to mechanical loading.",
        takeaway: "Use your bones—and give them a reason to adapt.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Nutrition",
        text: "Which statement about nutrition and young women's bone health makes the most sense?",
        options: [["A", "Eating less is always better"], ["B", "Adequate nutrition matters"], ["C", "Supplements can replace food"], ["D", "Nutrition doesn't matter if exercising"]],
        correct: "B",
        aha: "Healthy bones need more than one nutrient.",
        takeaway: "A healthy bone journey starts with enough of the right things.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Prevention",
        text: "Which habit can quietly work against long-term bone health?",
        options: [["A", "Regular strength training"], ["B", "Smoking"], ["C", "Eating a balanced diet"], ["D", "Staying active"]],
        correct: "B",
        aha: "Smoking is a recognised bone-health risk factor.",
        takeaway: "Some bone-health habits are about what you do; others are about what you avoid.",
      },
      {
        key: "Q6", slot: 6, topic: "Prevention",
        text: "When is the best time to start caring about your future bones?",
        options: [["A", "After 50"], ["B", "After the first fracture"], ["C", "Now"], ["D", "When I have pain"]],
        correct: "C",
        aha: "Your future bones don't suddenly become important when you get older.",
        takeaway: "They're influenced throughout life.",
      },
    ],
  },
  {
    key: "26-35",
    name: "Protect What You've Built",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Density",
        text: "True or false: If your bones don't hurt, they're probably healthy?",
        options: [["A", "True"], ["B", "False"]],
        correct: "B",
        aha: "Bone loss can happen without obvious symptoms.",
        takeaway: "Awareness should not depend on pain.",
      },
      {
        key: "Q2", slot: 2, topic: "Nutrition",
        text: "Which is more important for bone health?",
        options: [["A", "Calcium alone"], ["B", "Exercise alone"], ["C", "Nutrition + movement + healthy lifestyle"], ["D", "None"]],
        correct: "C",
        aha: "Bone health is not a calcium-only story.",
        takeaway: "Think beyond one nutrient.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "Why can menstrual health be relevant to bone health?",
        options: [["A", "Hormonal health can influence bone health"], ["B", "Periods directly strengthen bones"], ["C", "Periods have no relationship with bones"], ["D", "Only postmenopausal women need to care about bones"]],
        correct: "A",
        aha: "Persistent menstrual disturbances can be relevant to bone health.",
        takeaway: "Whole-body health matters.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Movement",
        text: "What is the better long-term strategy for maintaining muscle and bone?",
        options: [["A", "Strength training"], ["B", "Complete rest"], ["C", "Only supplements"], ["D", "Avoiding weight-bearing activity"]],
        correct: "A",
        aha: "Muscle and bone benefit from regular physical loading.",
        takeaway: "Maintain strength as well as bone.",
      },
      {
        key: "Q4", slot: 4, topic: "Movement",
        text: "Which office habit is least helpful for your bones?",
        options: [["A", "Taking movement breaks"], ["B", "Walking between tasks"], ["C", "Sitting for hours without moving"], ["D", "Strength training"]],
        correct: "C",
        aha: "Sedentary behaviour is a modifiable factor.",
        takeaway: "Move regularly.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Nutrition",
        text: "Which statement about pregnancy and bone health is most sensible?",
        options: [["A", "Pregnancy automatically causes osteoporosis"], ["B", "The body adapts to increased calcium demands, but adequate nutrition remains important"], ["C", "Pregnancy has no nutritional impact"], ["D", "Calcium is never needed during pregnancy"]],
        correct: "B",
        aha: "Pregnancy is not a bone disease, but nutritional demands change.",
        takeaway: "Adequate nutrition matters.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Bone Density",
        text: "Can men develop osteoporosis?",
        options: [["A", "Yes"], ["B", "No"], ["C", "Only after 70"], ["D", "Only if they have back pain"]],
        correct: "A",
        aha: "Osteoporosis is not exclusively a women's condition.",
        takeaway: "Men's bone health matters too.",
      },
      {
        key: "Q6", slot: 6, topic: "Prevention",
        text: "What would you rather protect for your future self?",
        options: [["A", "Strength"], ["B", "Mobility"], ["C", "Independence"], ["D", "All three"]],
        correct: "D",
        aha: "Strong bones support more than fracture avoidance.",
        takeaway: "Keep life moving.",
      },
    ],
  },
  {
    key: "36-45",
    name: "Your Future Bones Start Today",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Basics",
        text: "What happens to bone strength as we move through adulthood?",
        options: [["A", "It only gets stronger"], ["B", "It stays exactly the same"], ["C", "The balance between bone formation and breakdown changes with age"], ["D", "It doesn't change"]],
        correct: "C",
        aha: "Bone is continuously remodelled and the balance can change with age.",
        takeaway: "Long-term bone health starts before old age.",
      },
      {
        key: "Q2", slot: 2, topic: "Vitamin D",
        text: "Living in India guarantees enough Vitamin D. True or false?",
        options: [["A", "True"], ["B", "False"]],
        correct: "B",
        aha: "Vitamin D status varies despite living in a sunny country.",
        takeaway: "Sunny does not automatically mean sufficient.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "Why can the years around menopause become important for bone health?",
        options: [["A", "Bone growth suddenly starts"], ["B", "Changes in oestrogen can accelerate bone loss"], ["C", "Calcium stops working"], ["D", "Bones stop being living tissue"]],
        correct: "B",
        aha: "The menopausal transition can be a period of accelerated bone loss.",
        takeaway: "Menopause is not a bone disease, but it is an important time for awareness.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Bone Density",
        text: "Can men develop osteoporosis?",
        options: [["A", "Yes"], ["B", "No"], ["C", "Only after 70"], ["D", "Only if they have back pain"]],
        correct: "A",
        aha: "Men can also develop osteoporosis.",
        takeaway: "Bone health is relevant to both sexes.",
      },
      {
        key: "Q4", slot: 4, topic: "Movement",
        text: "Which activity gives your bones a strong message that they need to stay strong?",
        options: [["A", "Only stretching"], ["B", "Resistance and weight-bearing activity"], ["C", "Sitting"], ["D", "Sleeping"]],
        correct: "B",
        aha: "Mechanical loading supports skeletal adaptation.",
        takeaway: "Move with purpose.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Bone Density",
        text: "If someone has no pain during perimenopause, does that automatically mean their bones are fine?",
        options: [["A", "Yes"], ["B", "No"], ["C", "Only if they exercise"], ["D", "Only if they take calcium"]],
        correct: "B",
        aha: "Bone loss can be silent.",
        takeaway: "No pain does not equal a clinical assessment.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Movement",
        text: "Why does maintaining muscle matter?",
        options: [["A", "Muscle and bone are unrelated"], ["B", "Strength, mobility and balance support healthy ageing"], ["C", "Muscle only matters for appearance"], ["D", "Muscle prevents every fracture"]],
        correct: "B",
        aha: "Musculoskeletal health is interconnected.",
        takeaway: "Protect strength as well as bone.",
      },
      {
        key: "Q6", slot: 6, topic: "Prevention",
        text: "When is prevention most useful?",
        options: [["A", "Before the problem appears"], ["B", "After the first fracture"], ["C", "Only after 60"], ["D", "Only when pain starts"]],
        correct: "A",
        aha: "Prevention is most useful before a major problem.",
        takeaway: "Your future bones start today.",
      },
    ],
  },
  {
    key: "46-55",
    name: "The Bone-Health Turning Point",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Density",
        text: "Which can happen without you feeling a thing?",
        options: [["A", "Bone loss"], ["B", "A broken bone"], ["C", "Muscle contraction"], ["D", "All of the above"]],
        correct: "A",
        aha: "Osteoporosis can be silent.",
        takeaway: "Pain is not a reliable bone-health signal.",
      },
      {
        key: "Q2", slot: 2, topic: "Nutrition",
        text: "Which statement about calcium is closest to the truth?",
        options: [["A", "Calcium is the only thing bones need"], ["B", "Calcium matters, but bone health involves much more"], ["C", "Calcium automatically prevents osteoporosis"], ["D", "Calcium replaces exercise"]],
        correct: "B",
        aha: "Nutrition, activity and other factors matter.",
        takeaway: "Think bigger than calcium.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "Why does menopause matter for bone health?",
        options: [["A", "Bones stop functioning"], ["B", "Falling oestrogen levels can accelerate bone loss"], ["C", "Calcium can no longer be absorbed"], ["D", "Menopause has no relationship with bones"]],
        correct: "B",
        aha: "Menopause is an important period of accelerated bone loss.",
        takeaway: "Menopause is a time to pay attention, not panic.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Bone Density",
        text: "Who can develop osteoporosis?",
        options: [["A", "Only women"], ["B", "Only people over 70"], ["C", "Both men and women"], ["D", "Only people with back pain"]],
        correct: "C",
        aha: "Osteoporosis can affect men as well as women.",
        takeaway: "Bone health is not a women's-only topic.",
      },
      {
        key: "Q4", slot: 4, topic: "Bone Density",
        text: "What does a DXA scan actually measure?",
        options: [["A", "Muscle strength"], ["B", "Bone mineral density"], ["C", "Vitamin D level"], ["D", "Flexibility"]],
        correct: "B",
        aha: "DXA measures bone mineral density.",
        takeaway: "A clinical scan is different from an awareness quiz.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Prevention",
        text: "Which statement is more useful around menopause?",
        options: [["A", "If I don't have pain, I don't need to think about bones"], ["B", "Bone health deserves attention even before symptoms appear"], ["C", "Calcium alone will take care of it"], ["D", "Bone loss only happens after 70"]],
        correct: "B",
        aha: "Bone loss may be silent.",
        takeaway: "Awareness can start before a problem.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Prevention",
        text: "What is worth taking seriously in midlife?",
        options: [["A", "A fracture after a relatively minor fall"], ["B", "Maintaining strength and activity"], ["C", "Long-term risk factors for bone loss"], ["D", "All of the above"]],
        correct: "D",
        aha: "These can all be relevant to bone health.",
        takeaway: "Don't dismiss meaningful signals as 'just age'.",
      },
      {
        key: "Q6", slot: 6, topic: "Prevention",
        text: "A fracture after a relatively minor fall can sometimes be more than bad luck. Why?",
        options: [["A", "It may be a sign of bone fragility"], ["B", "It always means osteoporosis"], ["C", "It never matters"], ["D", "It only matters after 70"]],
        correct: "A",
        aha: "A low-trauma fracture can be an important reason to discuss bone health clinically.",
        takeaway: "Know when a conversation is worth having.",
      },
    ],
  },
  {
    key: "56-65",
    name: "Know What Changes With Age",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Density",
        text: "Can osteoporosis exist without obvious pain?",
        options: [["A", "Yes"], ["B", "No"]],
        correct: "A",
        aha: "Bone loss can be silent.",
        takeaway: "No pain does not rule out bone loss.",
      },
      {
        key: "Q2", slot: 2, topic: "Bone Density",
        text: "What does a DXA scan measure?",
        options: [["A", "Bone mineral density"], ["B", "Muscle mass"], ["C", "Vitamin D"], ["D", "Flexibility"]],
        correct: "A",
        aha: "DXA measures bone mineral density.",
        takeaway: "Know the test before you need to know the result.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "After menopause, why does bone health deserve more attention?",
        options: [["A", "Bone becomes inactive"], ["B", "Reduced oestrogen can accelerate bone loss"], ["C", "Calcium disappears from food"], ["D", "Walking becomes dangerous"]],
        correct: "B",
        aha: "Postmenopausal bone loss is clinically important.",
        takeaway: "Awareness becomes increasingly relevant.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Bone Density",
        text: "Can age-related bone loss affect men?",
        options: [["A", "Yes"], ["B", "No"], ["C", "Only after 80"], ["D", "Only after a fracture"]],
        correct: "A",
        aha: "Age-related bone loss can affect men too.",
        takeaway: "Bone health is for everyone.",
      },
      {
        key: "Q4", slot: 4, topic: "Movement",
        text: "True or false: Walking every day means you've done everything your bones need from exercise.",
        options: [["A", "True"], ["B", "False"]],
        correct: "B",
        aha: "Walking is healthy, but bone health benefits from broader activity including resistance and weight-bearing exercise.",
        takeaway: "Mix movement types.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Prevention",
        text: "Which event should make someone think about discussing bone health?",
        options: [["A", "Fracture after a minor fall"], ["B", "A normal day at work"], ["C", "Feeling hungry"], ["D", "None"]],
        correct: "A",
        aha: "A low-trauma fracture can be an important clinical signal.",
        takeaway: "Don't dismiss it as bad luck.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Movement",
        text: "What combination supports healthy ageing?",
        options: [["A", "Strength + balance + appropriate weight-bearing activity"], ["B", "Complete rest"], ["C", "Supplements alone"], ["D", "Only stretching"]],
        correct: "A",
        aha: "Strength and balance support healthy function.",
        takeaway: "Keep strength and mobility together.",
      },
      {
        key: "Q6", slot: 6, topic: "Prevention",
        text: "Why does bone health matter beyond the skeleton?",
        options: [["A", "Fractures can affect mobility"], ["B", "Mobility affects independence"], ["C", "Preventing falls and fractures supports healthy ageing"], ["D", "All of the above"]],
        correct: "D",
        aha: "Fractures can affect mobility and independence.",
        takeaway: "Strong bones support the life you want to keep living.",
      },
    ],
  },
  {
    key: "66+",
    name: "Strong Bones. Strong Independence.",
    questions: [
      {
        key: "Q1", slot: 1, topic: "Bone Basics",
        text: "What is the real goal of healthy bones as we age?",
        options: [["A", "Never having a fracture"], ["B", "Staying mobile and independent"], ["C", "Taking supplements forever"], ["D", "Avoiding exercise"]],
        correct: "B",
        aha: "Bone health is closely tied to mobility and independence.",
        takeaway: "Think beyond the bone.",
      },
      {
        key: "Q2", slot: 2, topic: "Prevention",
        text: "Why do falls matter to bone health?",
        options: [["A", "A fall can cause a fracture, especially when bones are fragile"], ["B", "Falls only affect balance"], ["C", "Falls have nothing to do with bones"], ["D", "Falls only matter to athletes"]],
        correct: "A",
        aha: "Fall prevention is an important part of fracture prevention.",
        takeaway: "Balance and strength matter.",
      },
      {
        key: "Q3-F", slot: 3, gender: "F", topic: "Bone Density",
        text: "After menopause, which statement is most useful to remember?",
        options: [["A", "Bone health becomes irrelevant"], ["B", "Bone loss can accelerate and deserves attention"], ["C", "Fractures are inevitable"], ["D", "Calcium alone solves the problem"]],
        correct: "B",
        aha: "Postmenopausal bone loss is clinically important.",
        takeaway: "Awareness supports prevention.",
      },
      {
        key: "Q3-M", slot: 3, gender: "M", topic: "Bone Density",
        text: "Can men experience age-related bone loss?",
        options: [["A", "Yes"], ["B", "No"]],
        correct: "A",
        aha: "Age-related bone loss affects men too.",
        takeaway: "Bone health remains relevant across life.",
      },
      {
        key: "Q4", slot: 4, topic: "Movement",
        text: "Which combination supports healthy ageing?",
        options: [["A", "Strength + balance + appropriate weight-bearing activity"], ["B", "Complete rest"], ["C", "Only stretching"], ["D", "Only supplements"]],
        correct: "A",
        aha: "A broader activity mix supports function and fracture prevention.",
        takeaway: "Move for strength, balance and life.",
      },
      {
        key: "Q5-F", slot: 5, gender: "F", topic: "Prevention",
        text: "Which could be a reason to discuss bone health with a doctor?",
        options: [["A", "Fracture after a minor fall"], ["B", "Noticeable loss of height"], ["C", "Increasing stoop"], ["D", "Any of the above"]],
        correct: "D",
        aha: "These can warrant clinical evaluation but are not diagnostic by themselves.",
        takeaway: "Know the signals worth discussing.",
      },
      {
        key: "Q5-M", slot: 5, gender: "M", topic: "Prevention",
        text: "What is worth paying attention to as you age?",
        options: [["A", "Loss of strength"], ["B", "Reduced balance"], ["C", "A fracture after a minor fall"], ["D", "All of the above"]],
        correct: "D",
        aha: "These can affect mobility and fracture risk.",
        takeaway: "Protect function.",
      },
      {
        key: "Q6", slot: 6, topic: "Bone Basics",
        text: "What would you most like your bones to help you keep doing?",
        options: [["A", "Travelling"], ["B", "Walking independently"], ["C", "Spending time with family"], ["D", "All of the above"]],
        correct: "D",
        aha: "Strong bones are about maintaining life and independence.",
        takeaway: "Strong bones. Strong independence.",
      },
    ],
  },
];

async function main() {
  const journey = await prisma.journey.upsert({
    where: { slug: "healthy-bones" },
    update: {},
    create: { slug: "healthy-bones", name: "Healthy Bones" },
  });

  const existing = await prisma.journeyVersion.findUnique({
    where: {
      journeyId_versionNumber: { journeyId: journey.id, versionNumber: 1 },
    },
  });
  if (existing) {
    if (!existing.shareConfig) {
      await prisma.journeyVersion.update({
        where: { id: existing.id },
        data: { shareConfig: SHARE_CONFIG },
      });
      console.log("Healthy Bones v1: shareConfig added to existing version.");
    } else {
      console.log("Healthy Bones v1 already seeded — nothing to do.");
    }
    return;
  }

  const version = await prisma.journeyVersion.create({
    data: {
      journeyId: journey.id,
      versionNumber: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
      flowConfig: FLOW_CONFIG,
      scoringConfig: SCORING_CONFIG,
      reportTemplate: REPORT_TEMPLATE,
      shareConfig: SHARE_CONFIG,
      languages: {
        create: [{ code: "en", name: "English", isDefault: true }],
      },
    },
  });

  for (const pathwayDef of PATHWAYS) {
    const pathway = await prisma.pathway.create({
      data: {
        journeyVersionId: version.id,
        key: pathwayDef.key,
        name: pathwayDef.name,
        eligibility: { ageRange: pathwayDef.key },
      },
    });

    for (const q of pathwayDef.questions) {
      await prisma.question.create({
        data: {
          journeyVersionId: version.id,
          pathwayId: pathway.id,
          questionKey: q.key,
          sequence: q.slot,
          topic: q.topic,
          translations: {
            create: [
              {
                language: "en",
                questionText: q.text,
                correctFeedback: q.aha,
                incorrectFeedback: q.aha,
                ahaMoment: q.aha,
                takeaway: q.takeaway,
              },
            ],
          },
          options: {
            create: q.options.map(([key, label], index) => ({
              optionKey: key,
              sequence: index + 1,
              isCorrect: key === q.correct,
              translations: { create: [{ language: "en", text: label }] },
            })),
          },
        },
      });
    }
  }

  const questionCount = await prisma.question.count({
    where: { journeyVersionId: version.id },
  });
  console.log(
    `Seeded Healthy Bones v1 (PUBLISHED): ${PATHWAYS.length} pathways, ${questionCount} questions.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
