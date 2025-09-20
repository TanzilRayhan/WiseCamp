import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { LoginRequest, RegisterRequest, AuthResponse, CreateProjectRequest, ProjectResponse, ProjectDetailResponse, CreateBoardRequest, Board, BoardSummaryResponse, CreateCardRequest, Card, User, UserResponse} from "../types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  // Project endpoints
  async getProjects(): Promise<ProjectResponse[]> {
    const response: AxiosResponse<ProjectResponse[]> = await this.api.get(
      "/projects"
    );
    return response.data;
  }

  async getProject(id: number): Promise<ProjectDetailResponse> {
    const response: AxiosResponse<ProjectDetailResponse> = await this.api.get(
      `/projects/${id}`
    );
    return response.data;
  }

  async createProject(
    projectData: CreateProjectRequest
  ): Promise<ProjectResponse> {
    const response: AxiosResponse<ProjectResponse> = await this.api.post(
      "/projects",
      projectData
    );
    return response.data;
  }

  async updateProject(
    id: number,
    projectData: Partial<CreateProjectRequest>
  ): Promise<ProjectResponse> {
    const response: AxiosResponse<ProjectResponse> = await this.api.put(
      `/projects/${id}`,
      projectData
    );
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/projects/${id}`);
  }

  async addProjectMember(projectId: number, email: string): Promise<void> {
    await this.api.post(`/projects/${projectId}/members`, { email });
  }

  async removeProjectMember(projectId: number, userId: number): Promise<void> {
    await this.api.delete(`/projects/${projectId}/members/${userId}`);
  }

  // Board endpoints
  async getBoards(): Promise<BoardSummaryResponse[]> {
    const response: AxiosResponse<BoardSummaryResponse[]> = await this.api.get(
      "/boards"
    );
    return response.data;
  }

  async getBoard(id: number): Promise<Board> {
    const response: AxiosResponse<Board> = await this.api.get(`/boards/${id}`);
    return response.data;
  }

  async createBoard(boardData: CreateBoardRequest): Promise<Board> {
    const response: AxiosResponse<Board> = await this.api.post(
      "/boards",
      boardData
    );
    return response.data;
  }

  async updateBoard(
    id: number,
    boardData: Partial<CreateBoardRequest>
  ): Promise<Board> {
    const response: AxiosResponse<Board> = await this.api.put(
      `/boards/${id}`,
      boardData
    );
    return response.data;
  }

  async deleteBoard(id: number): Promise<void> {
    await this.api.delete(`/boards/${id}`);
  }

  async addBoardMember(boardId: number, userId: number): Promise<void> {
    await this.api.post(`/boards/${boardId}/members`, { userId });
  }

  async removeBoardMember(boardId: number, userId: number): Promise<void> {
    await this.api.delete(`/boards/${boardId}/members/${userId}`);
  }

  // Card endpoints
  async createCard(cardData: CreateCardRequest): Promise<Card> {
    const response: AxiosResponse<Card> = await this.api.post(
      "/cards",
      cardData
    );
    return response.data;
  }

  async createColumn(
    boardId: number,
    name: string,
    position?: number
  ): Promise<void> {
    await this.api.post(`/boards/${boardId}/columns`, { name, position });
  }

  async updateColumn(
    boardId: number,
    columnId: number,
    name?: string,
    position?: number
  ): Promise<void> {
    await this.api.put(`/boards/${boardId}/columns/${columnId}`, {
      name,
      position,
    });
  }

  async deleteColumn(boardId: number, columnId: number): Promise<void> {
    await this.api.delete(`/boards/${boardId}/columns/${columnId}`);
  }

  async updateCard(
    id: number,
    cardData: Partial<CreateCardRequest>
  ): Promise<Card> {
    const response: AxiosResponse<Card> = await this.api.put(
      `/cards/${id}`,
      cardData
    );
    return response.data;
  }

  async deleteCard(id: number): Promise<void> {
    await this.api.delete(`/cards/${id}`);
  }

  async moveCard(
    cardId: number,
    columnId: number,
    position: number
  ): Promise<Card> {
    const response: AxiosResponse<Card> = await this.api.patch(
      `/cards/${cardId}/move`,
      {
        columnId,
        position,
      }
    );
    return response.data;
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get("/users");
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.get(
      "/users/me"
    );
    return response.data;
  }

  async updateCurrentUser(
    data: Partial<Pick<User, "name" | "username" | "email">>
  ): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(
      "/users/me",
      data
    );
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  removeAuthToken(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

export const apiService = new ApiService();
