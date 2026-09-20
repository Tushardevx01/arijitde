import { getCsrfToken } from './csrf';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: Response,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    return new ApiError(
      data?.detail || data?.error || response.statusText,
      response.status,
      response,
      data
    );
  }
}

const API_BASE = '/api/v1';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as T;
}

// Local type definitions to avoid import issues
type User = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  role: 'GUEST' | 'CLIENT' | 'ADMIN';
  pan?: string;
  dob?: string;
  anniversary?: string;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
};

type Assessment = {
  id: string;
  userId: string;
  age: number;
  goal: string;
  ageRange?: string;
  lifeStage?: string;
  investmentTenure?: string;
  isCompletePortfolio?: boolean;
  investmentStyle?: string;
  expectedReturn?: string;
  riskBehavior?: string;
  monthlyInvestment?: string;
  emergencyFund?: string;
  createdAt: string;
  updatedAt: string;
};

type Lead = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  scoreId?: string;
  slot?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type AdvisorySession = {
  id: string;
  userId: string;
  preferredSlot1: string;
  preferredSlot2: string;
  preferredSlot3: string;
  confirmedSlot?: string;
  googleMeetLink?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
};

type Portfolio = {
  id: string;
  userId: string;
  assessmentId?: string;
  name: string;
  description?: string;
  totalValue?: number;
  createdAt: string;
  updatedAt: string;
};

type Score = {
  id: string;
  portfolioId: string;
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: string;
  insights?: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedResponse = {
  success: boolean;
  data: {
    items: any[];
    total: number;
    page: number;
    nextCursor?: string;
    nextCursorId?: string;
  };
};

type ExistingClient = {
  id: string;
  name?: string;
  pan?: string;
  email?: string;
  mobile?: string;
  city?: string;
  aum?: number;
  purchaseValue?: number;
  createdAt: string;
  updatedAt: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
};

type SupportQuery = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedData = {
  items: any[];
  total: number;
  page: number;
  nextCursor?: string;
  nextCursorId?: string;
};

type Folio = {
  id: string;
  name?: string;
  pan?: string;
  email?: string;
  mobile?: string;
  city?: string;
  aum?: number;
  purchaseValue?: number;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  // Auth
  auth: {
    me: () => fetchApi<User>('/auth/me'),
    login: (data: { email: string; password: string }) => 
      fetchApi<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { email: string; password: string; name: string; phone?: string }) =>
      fetchApi<{ success: boolean; data: { user: User } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    google: (credential: string) =>
      fetchApi<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      }),
    logout: () => fetchApi('/auth/logout', { method: 'POST' }),
    forgotPassword: (email: string) =>
      fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
      fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: { email: string; otp: string }) =>
      fetchApi('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Assessments
  assess: {
    list: () => fetchApi<Assessment[]>('/assess'),
    get: (id: string) => fetchApi<Assessment>(`/assess/${id}`),
    getUser: (userId: string) => fetchApi<Assessment | null>(`/assess/user/${userId}`),
    create: (data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchApi<Assessment>('/assess', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Leads
  leads: {
    list: (params?: { status?: string; page?: number; limit?: number }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<{ success: boolean; data: { items: Lead[]; total: number; page: number; nextCursor?: string; nextCursorId?: string } }>(`/leads${search ? `?${search}` : ''}`);
    },
    myBookings: () => fetchApi<Lead[]>('/leads/my-bookings'),
    availability: () => fetchApi<string[]>('/leads/availability'),
    mySessions: () => fetchApi<AdvisorySession[]>('/leads/my-sessions'),
    adminSessions: () => fetchApi<AdvisorySession[]>('/leads/admin/sessions'),
    create: (data: { name: string; phone: string; scoreId?: string; slot?: string }) =>
      fetchApi<{ leadId: string }>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: { status: Lead['status']; notes?: string }) =>
      fetchApi<Lead>(`/leads/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    bookSession: (data: { slot1: string; slot2: string; slot3: string }) =>
      fetchApi<AdvisorySession>('/leads/book-session', { method: 'POST', body: JSON.stringify(data) }),
    bookSessionPublic: (data: { name: string; phone: string; email: string; slot1: string; slot2: string; slot3: string }) =>
      fetchApi<AdvisorySession>('/leads/book-session-public', { method: 'POST', body: JSON.stringify(data) }),
    adminConfirm: (id: string, data: { confirmedSlot: string; googleMeetLink: string }) =>
      fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
    adminNotes: (id: string, notes?: string) =>
      fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}/notes`, { method: 'POST', body: JSON.stringify({ notes }) }),
    adminRefund: (id: string) => fetchApi(`/leads/admin/sessions/${id}/refund`, { method: 'POST' }),
    adminDelete: (id: string) => fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}`, { method: 'DELETE' }),
  },

  // Portfolios
  portfolio: {
    list: () => fetchApi<Portfolio[]>('/portfolio'),
    get: (id: string) => fetchApi<Portfolio>(`/portfolio/${id}`),
    clientData: () => fetchApi<any>('/portfolio/client-data'),
    create: (data: { name: string; assessmentId: string; description?: string }) =>
      fetchApi<Portfolio>('/portfolio', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Scores
  score: {
    portfolio: (portfolioId: string) => fetchApi<Score[]>(`/score/portfolio/${portfolioId}`),
    get: (id: string) => fetchApi<Score>(`/score/${id}`),
    calculate: (portfolioId: string) => fetchApi<Score>(`/score/${portfolioId}`, { method: 'POST' }),
  },

  // Admin
  admin: {
    users: (page = 1, limit = 20) => fetchApi<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; pages: number } }>(`/admin/users?page=${page}&limit=${limit}`),
    leads: (page = 1, limit = 20) => fetchApi<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; pages: number } }>(`/admin/leads?page=${page}&limit=${limit}`),
    existingClients: (params?: { page?: number; limit?: number; search?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; pages: number } }>(`/admin/existing-clients${search ? `?${search}` : ''}`);
    },
    uploadPortfolio: (formData: FormData) => fetchApi('/admin/portfolio-upload', { method: 'POST', body: formData, headers: {} }),
    syncFolios: () => fetchApi('/admin/sync-folios', { method: 'POST' }),
    uploadExistingClients: (formData: FormData) => fetchApi('/admin/existing-clients/upload', { method: 'POST', body: formData, headers: {} }),
    clearExistingClients: () => fetchApi('/admin/existing-clients/clear', { method: 'DELETE' }),
    deleteExistingClient: (id: string) => fetchApi<any>(`/admin/existing-clients/${id}`, { method: 'DELETE' }),
  },

  // Chat
  chat: (data: { message: string; context?: string }) =>
    fetchApi<any>('/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Contact
  contact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    fetchApi<any>('/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Support
  support: {
    list: () => fetchApi<any[]>('/support'),
    submit: (data: { subject: string; message: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }) =>
      fetchApi<any>('/support', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Health
  health: () => fetchApi<{ status: string }>('/health'),
};

export { fetchApi };

// Re-export local types
export type {
  User,
  Assessment,
  Lead,
  Portfolio,
  Score,
  AdvisorySession,
  ExistingClient,
  ContactMessage,
  SupportQuery,
  PaginatedResponse,
  PaginatedData,
  Folio,
};