import axios from 'axios';
import { 
  BugExhibit, 
  CreateBugExhibit, 
  AuthResponse, 
  LoginDto, 
  RegisterDto,
  UpvoteResponse,
  CreateCommentDto
} from '@/types/bug';

const API_BASE_URL = 'http://localhost:5008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach Bearer token dynamically on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export interface ExhibitComment {
  id: number;
  text: string;
  createdAt: string;
  authorUsername: string;
}

export const registerUser = async (data: RegisterDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

// Cache-busted GET requests ensure fresh upvote counts across user sessions
export const getBugs = async (): Promise<BugExhibit[]> => {
  const response = await api.get<BugExhibit[]>(`/bugs?_t=${Date.now()}`);
  return response.data;
};

export const getBugById = async (id: number): Promise<BugExhibit> => {
  const response = await api.get<BugExhibit>(`/bugs/${id}?_t=${Date.now()}`);
  return response.data;
};

export const getMyExhibits = async (): Promise<BugExhibit[]> => {
  const response = await api.get<BugExhibit[]>(`/bugs/my-exhibits?_t=${Date.now()}`);
  return response.data;
};

export const getComments = async (bugId: number): Promise<ExhibitComment[]> => {
  const response = await api.get(`/bugs/${bugId}/comments`);
  return response.data;
};

// Standard JSON POST
export const createBug = async (bug: CreateBugExhibit): Promise<BugExhibit> => {
  // Make sure isOpenQuestion is explicitly boolean
  const payload = {
    ...bug,
    isOpenQuestion: Boolean(bug.isOpenQuestion),
  };
  const response = await api.post<BugExhibit>('/bugs', payload);
  return response.data;
};

export const toggleUpvote = async (id: number): Promise<UpvoteResponse> => {
  const response = await api.post<UpvoteResponse>(`/bugs/${id}/upvote`);
  return response.data;
};

export const addComment = async (bugId: number, text: string): Promise<ExhibitComment> => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    `/bugs/${bugId}/comments`,
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};


export const updateBug = async (id: number, bug: CreateBugExhibit): Promise<void> => {
  await api.put(`/bugs/${id}`, bug);
};

export const deleteBug = async (id: number): Promise<void> => {
  await api.delete(`/bugs/${id}`);
};

export interface AiSummaryResponse {
  summary: string;
}

export const summarizeBug = async (id: number): Promise<AiSummaryResponse> => {
  const response = await api.post<AiSummaryResponse>(`/bugs/${id}/summarize`);
  return response.data;
};

export const uploadScreenshot = async (bugId: number, file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file); // Must match the parameter name 'IFormFile file' in C#

  const response = await api.post<{ imageUrl: string }>(`/bugs/${bugId}/photo`, formData);
  return response.data;
};

export const acceptSolution = async (bugId: number, commentId: number) => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    `/bugs/${bugId}/accept-solution/${commentId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};