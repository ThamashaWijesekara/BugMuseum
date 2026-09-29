export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateBugExhibitData {
  title: string;
  programmingLanguage: string;
  category: string;
  difficulty: string;
  expectedBehavior: string;
  actualBehavior: string;
  rootCause: string;
  solution: string;
  lessonLearned: string;
}

export interface CreateBugExhibit {
  title: string;
  programmingLanguage: string;
  category: string;
  difficulty: string;
  expectedBehavior: string;
  actualBehavior: string;
  rootCause: string;
  solution: string;
  lessonLearned: string;
  isOpenQuestion?: boolean;
}

export interface BugExhibit {
  id: number;
  title: string;
  programmingLanguage: string;
  category: string;
  difficulty: string;
  expectedBehavior: string;
  actualBehavior: string;
  rootCause: string;
  solution: string;
  lessonLearned: string;
  imageUrl?: string;
  isOpenQuestion?: boolean;
  isResolved?: boolean;
  acceptedCommentId?: number;
  aiDiagnosticHint?: string;
  createdAt: string;
  userId: number;
  authorUsername: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  commentCount: number;
}

export interface UpvoteResponse {
  upvoteCount: number;
  hasUpvoted: boolean;
}

export interface ExhibitComment {
  id: number;
  text: string;
  createdAt: string;
  authorUsername: string;
}

export interface CreateCommentDto {
  text: string;
}

export interface ResolutionTimelineStep {
  title: string;
  timeframe: string;
  description: string;
}