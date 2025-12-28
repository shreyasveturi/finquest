export type ArticleParagraph = {
  id: string;
  text: string;
  checkpointId?: string;
};

export type KeyTerm = {
  id: string;
  term: string;
  friendlyDefinition: string;
  whyItMatters: string;
};

export type QuestionType = 'shortText' | 'thisOrThat';

export type Checkpoint = {
  id: string;
  title: string;
  paragraphId: string;
  prompt: string;
  helperText?: string;
  questionType: QuestionType;
  choices?: string[];
  modelAnswer: string;
  hint: string;
};

export type ReasoningLink = {
  title: string;
  prompt: string;
};

export type ReasoningLinksBlock = {
  paragraphId: string;
  summary: string;
  links: ReasoningLink[];
};

export type Lesson = {
  slug: string;
  title: string;
  subtitle?: string;
  attribution: string;
  articleTitle: string;
  articleSource?: string;
  articleUrl?: string;
  articleId: string;
  paragraphs: ArticleParagraph[];
  keyTerms: KeyTerm[];
  checkpoints: Checkpoint[];
  reasoningLinks?: ReasoningLinksBlock[];
  expertReasoning?: {
    shock: string;
    channel: string;
    impact: string;
    channels: string[];
    winners: string[];
    losers: string[];
  };
  predictionChoices?: { id: string; label: string }[];
  predictionCorrectId?: string;
};
