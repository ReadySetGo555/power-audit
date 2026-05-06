import type { Stage, QuestionSet, TierMeta } from "./types";

export const COLOR = "#7C5CBF";

export const STAGES: Stage[] = [
  { id: "envision", label: "Envision", icon: "👁",  description: "See and shape what you want to create" },
  { id: "decide",   label: "Decide",   icon: "🤝", description: "Commit to a clear direction" },
  { id: "plan",     label: "Plan",     icon: "✏️", description: "Map the path from here to there" },
  { id: "prepare",  label: "Prepare",  icon: "🏗️", description: "Get yourself and your resources ready" },
  { id: "do",       label: "Do",       icon: "✅", description: "Take action and stay in motion" },
  { id: "refine",   label: "Refine",   icon: "♻️", description: "Reflect, learn, and adjust course" },
];

export const SETS: QuestionSet[] = [
  {
    id: "s1", label: "Expressing Your Ideas",
    poleLow: "Very Difficult", poleHigh: "Very Easy",
    question: (s) => ({ envision: "How easy is it to express the idea of what I envision to create?", decide: "How easy is it to articulate how and why I make decisions?", plan: "How easy is it to articulate what I plan to create/execute to realize my vision?", prepare: "How easy is it to articulate the way I will actively prepare to create/execute before taking action?", do: "How easy is it to articulate how and why I do what I do?", refine: "How easy is it to articulate how I can make my experience/results better the next time?" } as Record<string,string>)[s] ?? "",
    excitedPrompt: "Choose the ONE stage you're most excited to improve how you express and articulate your ideas, reasoning and processes.",
    impactPrompt: "Choose the ONE stage you believe improving will be most impactful on how you express and articulate your ideas, reasoning and processes.",
  },
  {
    id: "s2", label: "Expressing Yourself",
    poleLow: "Very Difficult", poleHigh: "Very Easy",
    question: (s) => ({ envision: "How easy is it to express myself through what I envision to create?", decide: "How easy is it to express myself through what I decide?", plan: "How easy is it to express myself through what I plan to create/execute?", prepare: "How easy is it to express myself through what I prepare to create/execute?", do: "How easy is it to express myself through taking action?", refine: "How easy is it to express myself through making my experience/results better for the next time?" } as Record<string,string>)[s] ?? "",
    excitedPrompt: "Choose the ONE stage you're most excited to improve how you express yourself.",
    impactPrompt: "Choose the ONE stage you believe improving will be most impactful on how you express yourself.",
  },
  {
    id: "s3", label: "Taking Immediate Action",
    poleLow: "Very Difficult", poleHigh: "Very Easy",
    question: (s) => ({ envision: "How easy is it to take immediate action to envision what I want to create?", decide: "How easy is it to take immediate action to decide what I want to do?", plan: "How easy is it to take immediate action to plan what I want to create/execute?", prepare: "How easy is it to take immediate action to prepare what I want to create/execute?", do: "How easy is it to take immediate action to execute a plan?", refine: "How easy is it to take immediate action to map out how I can make my experience/results better the next time?" } as Record<string,string>)[s] ?? "",
    excitedPrompt: "Choose the ONE stage you're most excited to improve when it comes to taking immediate action.",
    impactPrompt: "Choose the ONE stage you believe improving will be most impactful when it comes to taking immediate action.",
  },
  {
    id: "s4", label: "Making Continual Progress",
    poleLow: "Negative Impact", poleHigh: "Positive Impact",
    question: (s) => ({ envision: "How does my current version of envisioning what I want to create impact my continual progress over longer spans of time?", decide: "How does my current version of deciding what I want to create impact my continual progress over longer spans of time?", plan: "How does my current version of planning to create/execute impact my continual progress over longer spans of time?", prepare: "How does my current version of preparing to create/execute impact my continual progress over longer spans of time?", do: "How does my current version of taking action impact my continual progress over longer spans of time?", refine: "How does my current version of refinement (making my experience/results better for the next iteration) impact my continual progress over longer spans of time?" } as Record<string,string>)[s] ?? "",
    excitedPrompt: "Choose the ONE stage you're most excited to improve when it comes to making continual progress.",
    impactPrompt: "Choose the ONE stage you believe improving will be most impactful when it comes to making continual progress.",
  },
];

export const GOAL_PROMPTS = [
  { id: "success",    label: "Define Success",    question: "State what the outcome looks like as simple and straightforward as possible.", placeholder: "Success looks like..." },
  { id: "goal",       label: "Set Your Goal",     question: "What is the specific, tangible goal you want to accomplish?",                 placeholder: "My goal is..." },
  { id: "timeframe",  label: "Set a Timeframe",   question: "When will you accomplish this by?",                                           placeholder: "I will accomplish this by..." },
  { id: "first_step", label: "Your First Action", question: "What is the one action you will take right now?",                             placeholder: "Right now, I will..." },
  { id: "obstacle",   label: "Name the Obstacle", question: "What is most likely to get in the way?",                                     placeholder: "The most likely obstacle is..." },
  { id: "support",    label: "Identify Support",  question: "What support or accountability would make the biggest difference?",           placeholder: "What would help most is..." },
];

export const SOMATIC_PROMPTS = [
  { id: "identify",  label: "Identify the Belief",   question: "What belief is driving this somatic experience?",              placeholder: "The belief I notice is..." },
  { id: "agreement", label: "Name the Agreement",    question: "What action have you been taking because of this belief?",     placeholder: "Because of this belief, I have been..." },
  { id: "rewrite",   label: "Rewrite the Agreement", question: "What new belief and action would serve you better?",           placeholder: "A more empowering belief is..." },
  { id: "commit",    label: "Commit to the New",     question: "What will you do differently starting right now?",             placeholder: "Starting now, I will..." },
];

export const BLOCK_PROMPTS = [
  { id: "actions",          label: "Actions",               question: "What actions are you taking (or avoiding) because of this block?",                                                        placeholder: "I am taking (or avoiding)..." },
  { id: "behaviors",        label: "Behaviors",             question: "What patterns or behaviors do you notice in yourself around this?",                                                        placeholder: "I notice the pattern of..." },
  { id: "feelings",         label: "Feelings & Sensations", question: "What do you feel in your body when this block is present?",                                                               placeholder: "I feel in my body..." },
  { id: "thoughts",         label: "Thoughts",              question: "What is your mind telling you about this?",                                                                               placeholder: "My mind says..." },
  { id: "snapshot",         label: "The Snapshot",          question: "Looking at your actions, behaviors, feelings, and thoughts together — what do you see?",                                  placeholder: "What I see is..." },
  { id: "belief",           label: "The Belief",            question: "What belief is driving all of this?",                                                                                     placeholder: "The belief driving this is..." },
  { id: "agreement",        label: "The Agreement",         question: "What have you been agreeing to because of this belief?",                                                                  placeholder: "I have been agreeing to..." },
  { id: "new_agreement",    label: "New Agreement",         question: "What new agreement would serve you better?",                                                                              placeholder: "A better agreement would be..." },
  { id: "immediate_action", label: "Immediate Action",      question: "What is the one action connected to this new agreement that you will take or schedule right now?",                        placeholder: "Right now I will..." },
];

export const TIER_META: Record<number, TierMeta> = {
  1: { label: "Tier 1 — Urgent",           desc: "Excited or impactful + somatic/block. Clear the block first.", color: "#C0392B" },
  2: { label: "Tier 2 — Important",        desc: "Both excited and impactful. Ready to build.",                  color: "#E67E22" },
  3: { label: "Tier 3 — Influential",      desc: "Excited or impactful. Strong improvements available.",         color: "#3498DB" },
  4: { label: "Tier 4 — Somatic / Blocks", desc: "Flagged but not chosen. Revisit when you have capacity.",     color: "#7C5CBF" },
};
