import { StudyDifficulty, StudyLength, UserTier } from "@/lib/constants";
export { StudyDifficulty, StudyLength, UserTier };

export interface StudySection {
  sectionId: string;
  title: string;
  content: string;
  isLocked?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyContent {
  [key: string]: string | QuizQuestion[] | any;
  quiz?: QuizQuestion[];
}

export interface StudyStats {
  views: number;
  clones: number;
  likes: number;
  shares: number;
}

export interface StudyMetadata {
  id: string;
  ownerId: string;
  title: string;
  theme: string;
  passages: string;
  difficulty: StudyDifficulty;
  length: StudyLength;
  createdAt: number;
  isPublic: boolean;
  isLocked?: boolean; // If generation failed or partial
  imageUrl?: string;
  stats?: StudyStats;
}

export interface BibleStudy {
  metadata: StudyMetadata;
  content: StudyContent;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: UserTier;
  bio?: string;
  favoriteBook?: string;
  favoritePassage?: string;
  reputation?: number;
  highlightedStudyIds?: string[]; // IDs of studies showcased on profile
  history: string[]; // IDs of last viewed studies
  lastGenerationAt?: number;
}
