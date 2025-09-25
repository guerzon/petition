// SERVER-ONLY TYPES - DO NOT IMPORT IN CLIENT CODE
// Use types from src/types/api.ts for client-side code

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  anonymous: boolean
  created_at: string
  updated_at: string
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
  location?: string // for local petitions
  created_by: number
  created_at: string
  updated_at: string
}

export interface Signature {
  id: number
  petition_id: number
  user_id: number
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

export interface PetitionCategory {
  petition_id: number
  category_id: number
}

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
  created_by: number
  category_ids?: number[]
}

export interface CreateSignatureInput {
  petition_id: number
  user_id: number
  comment?: string
  anonymous?: boolean
  ip_address?: string
}

export interface PetitionWithDetails extends Petition {
  creator: Pick<User, 'first_name' | 'last_name' | 'anonymous'>
  categories: Category[]
  signature_count: number
}
