import axios, { AxiosInstance, AxiosError } from 'axios';

interface AuthData {
  token: string | null;
  refreshToken: string | null;
}

interface RefreshResponse {
  access: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Chat {
  id: number;
  title: string;
}

interface Message {
  id: number;
  chat_id: number;
  text: string;
  sender: string;
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
}

class API {
  private $api: AxiosInstance;

  constructor() {
    this.$api = axios.create({
      baseURL: 'https://vkedu-fullstack-div2.ru/api/',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.$api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.$api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            try {
              const response = await axios.post<RefreshResponse>(
                `${this.$api.defaults.baseURL}/auth/refresh/`,
                { refresh: refreshToken },
              );
              localStorage.setItem('token', response.data.access);
              if (error.config) {
                error.config.headers!.Authorization = `Bearer ${response.data.access}`;
                return this.$api.request(error.config);
              }
            } catch {
              this.clearAuthData();
              window.location.href = '/#/login';
            }
          } else {
            this.clearAuthData();
            window.location.href = '/#/login';
          }
        } else if (status && status >= 500) {
          console.error('Server error:', error.response?.data || error.message);
        } else if (status === 404) {
          console.error('Resource not found:', error.response?.data);
        }
        return Promise.reject(error);
      },
    );
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
  }

  private async refreshAuthToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post<RefreshResponse>(
        `${this.$api.defaults.baseURL}/auth/refresh/`,
        { refresh: refreshToken },
      );
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  public async checkAuthStatus(): Promise<boolean> {
    const { token, refreshToken } = this.getAuthData();
    if (token) {
      return true;
    } else if (refreshToken) {
      try {
        await this.refreshAuthToken(refreshToken);
        return true;
      } catch {
        return false;
      }
    } else {
      return false;
    }
  }

  private getAuthData(): AuthData {
    return {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refresh'),
    };
  }

  public async createChat(chatName: string): Promise<Chat> {
    try {
      const response = await this.$api.post<Chat>('/chats/', { title: chatName.trim() });
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  public async deleteChat(chatId: number): Promise<void> {
    try {
      await this.$api.delete(`/chats/${chatId}/`);
    } catch (error: unknown) {
      throw error;
    }
  }

  public async sendMessage(chatId: number, messageText: string): Promise<Message> {
    try {
      const response = await this.$api.post<Message>('/message/', {
        chat_id: chatId,
        text: messageText,
      });
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  public async fetchUsers({
    search = '',
    page = 1,
    page_size = 10,
  }: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const response = await this.$api.get<PaginatedResponse<User>>('/users/', {
        params: { search, page, page_size },
      });
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  public async fetchMessages(chatId: number): Promise<Message[]> {
    try {
      const response = await this.$api.get<PaginatedResponse<Message>>(`/messages/?chat=${chatId}`);
      return response.data.results;
    } catch (error: unknown) {
      throw error;
    }
  }

  public async fetchChats(): Promise<Chat[]> {
    try {
      const response = await this.$api.get<PaginatedResponse<Chat>>('/chats/');
      return response.data.results;
    } catch (error: unknown) {
      throw error;
    }
  }

  public createCancelToken() {
    return axios.CancelToken.source();
  }

  public getApiInstance(): AxiosInstance {
    return this.$api;
  }
}

export const api = new API();
export default api;
