// Client-side API types - these mirror the database types but are separate
export interface User {
  id: string // Changed from number to string for Auth.js compatibility
  first_name: string
  last_name: string
  email: string
  anonymous: boolean
  created_at: string
  updated_at: string
  // Auth.js fields
  name?: string
  image?: string
  emailVerified?: string
}

export interface Petition {
  id: number
  title: string
  description: string
  type: 'local' | 'national'
  image_url?: string
  target_count: number
  current_count: number
  status: 'active' | 'completed' | 'closed'
  location?: string
  slug: string
  due_date: string
  created_by: string // Changed from number to string
  created_at: string
  updated_at: string
}

export interface Signature {
  id: number
  petition_id: number
  user_id: string // Changed from number to string
  comment?: string
  anonymous: boolean
  ip_address?: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface PetitionWithDetails extends Petition {
  creator: Pick<User, 'first_name' | 'last_name' | 'anonymous'>
  categories: Category[]
  signature_count: number
}

// Input types for API requests
export interface CreateUserInput {
  first_name: string
  last_name: string
  email: string
  anonymous?: boolean
}

export interface CreatePetitionInput {
  title: string
  description: string
  type: 'local' | 'national'
  image_url?: string
  target_count?: number
  location?: string
  due_date?: string // Optional, will default to 60 days from now
  created_by: string // Changed from number to string
  category_ids?: number[]
}

export interface CreateSignatureInput {
  petition_id: number
  user_id: string // Changed from number to string
  comment?: string
  anonymous?: boolean
  ip_address?: string
}
