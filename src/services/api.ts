import type {
  CreateUserInput,
  CreatePetitionInput,
  CreateSignatureInput,
  User,
  Petition,
  Signature,
  Category,
  PetitionWithDetails,
} from '@/types/api'

// API base URL - Vite Cloudflare plugin serves functions on same port
const API_BASE_URL = '' // Always use relative URLs - Vite plugin handles routing

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`)
  }

  return await response.json()
}

// User API
export const userApi = {
  async create(userData: CreateUserInput): Promise<User> {
    return apiRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async getById(id: number): Promise<User> {
    return apiRequest<User>(`/api/users/${id}`)
  },

  async getByEmail(email: string): Promise<User> {
    return apiRequest<User>(`/api/users/email/${encodeURIComponent(email)}`)
  },
}

// Petition API
export const petitionApi = {
  async create(petitionData: CreatePetitionInput): Promise<Petition> {
    return apiRequest<Petition>('/api/petitions', {
      method: 'POST',
      body: JSON.stringify(petitionData),
    })
  },

  async getById(id: number): Promise<PetitionWithDetails> {
    return apiRequest<PetitionWithDetails>(`/api/petitions/${id}`)
  },

  async getBySlug(slug: string): Promise<PetitionWithDetails> {
    return apiRequest<PetitionWithDetails>(`/api/petitions/slug/${slug}`)
  },

  async getAll(
    params: {
      limit?: number
      offset?: number
      type?: 'local' | 'national'
    } = {}
  ): Promise<PetitionWithDetails[]> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.type) searchParams.set('type', params.type)

    return apiRequest<PetitionWithDetails[]>(`/api/petitions?${searchParams}`)
  },

  async getSignatures(
    petitionId: number,
    params: {
      limit?: number
      offset?: number
    } = {}
  ): Promise<Signature[]> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    return apiRequest<Signature[]>(`/api/petitions/${petitionId}/signatures?${searchParams}`)
  },
}

// Signature API
export const signatureApi = {
  async create(signatureData: CreateSignatureInput): Promise<Signature> {
    return apiRequest<Signature>('/api/signatures', {
      method: 'POST',
      body: JSON.stringify(signatureData),
    })
  },

  async getUserSignatures(userId: number): Promise<Signature[]> {
    return apiRequest<Signature[]>(`/api/users/${userId}/signatures`)
  },
}

// Category API
export const categoryApi = {
  async getAll(): Promise<Category[]> {
    return apiRequest<Category[]>('/api/categories')
  },

  async create(name: string, description?: string): Promise<Category> {
    return apiRequest<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  },
}

export { ApiError }
