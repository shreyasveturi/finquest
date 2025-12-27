export interface CheckpointFeedback {
  strengths: string[];
  improvements: string[];
  missingLinks: string[];
  betterAnswer: string;
  scores: {
    structure: number;
    commercialAwareness: number;
    clarity: number;
    specificity: number;
  };
  followUps: string[];
}
