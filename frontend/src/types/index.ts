// User types
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  username: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  owner: UserResponse;
  members: UserResponse[];
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  boardCount: number;
  createdAt: string;
}

export interface ProjectMemberResponse {
  id: number;
  name: string;
  email: string;
  username: string;
  joinedAt: string;
}

export interface ProjectBoardResponse {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ProjectDetailResponse extends ProjectResponse {
  members: ProjectMemberResponse[];
  boards: ProjectBoardResponse[];
  updatedAt: string;
}

// Board types
export interface Board {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  userId: number;
  user: UserResponse;
  members: UserResponse[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardSummaryResponse {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount: number;
  cardCount: number;
  createdAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description: string;
  isPublic: boolean;
  projectId?: number;
}

// Column types
export interface Column {
  id: number;
  name: string;
  position: number;
  boardId: number;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

// Card types
export interface Card {
  id: number;
  title: string;
  name: string;
  description: string;
  position: number;
  isActive: boolean;
  dueDate?: string;
  columnId: number;
  attachments: CardAttachment[];
  checklistItems: ChecklistItem[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CardResponse {
  id: number;
  title: string;
  name: string;
  description: string;
  position: number;
  isActive: boolean;
  dueDate?: string;
  attachmentCount: number;
  checklistItemCount: number;
  completedChecklistItems: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  title: string;
  name: string;
  description: string;
  dueDate?: string;
  columnId: number;
}

// Card Attachment types
export interface CardAttachment {
  id: number;
  filename: string;
  location: string;
  cardId: number;
  createdAt: string;
  updatedAt: string;
}

// Checklist Item types
export interface ChecklistItem {
  id: number;
  name: string;
  isChecked: boolean;
  position: number;
  cardId: number;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: number;
  comment: string;
  cardId: number;
  userId: number;
  user: UserResponse;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
