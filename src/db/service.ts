// SERVER-ONLY DATABASE SERVICE - DO NOT IMPORT IN CLIENT CODE
// This file should only be used in Cloudflare functions

/// <reference types="@cloudflare/workers-types" />

import type {
  User,
  Petition,
  Signature,
  Category,
  CreateUserInput,
  CreatePetitionInput,
  CreateSignatureInput,
  PetitionWithDetails,
} from './schemas/types'

export class DatabaseService {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  // User methods
  async createUser(userData: CreateUserInput): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (first_name, last_name, email, anonymous)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `)

    const result = await stmt
      .bind(userData.first_name, userData.last_name, userData.email, userData.anonymous || false)
      .first<User>()

    if (!result) {
      throw new Error('Failed to create user')
    }

    return result
  }

  async getUserById(id: number): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return await stmt.bind(id).first<User>()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    return await stmt.bind(email).first<User>()
  }

  // Helper method to generate URL-friendly slug
  private generateSlug(title: string, id?: number): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

    return id ? `${baseSlug}-${id}` : baseSlug
  }

  // Helper method to get due date (60 days from now if not provided)
  private getDueDate(providedDate?: string): string {
    if (providedDate) {
      return providedDate
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 60)
    return dueDate.toISOString()
  }

  // Petition methods
  async createPetition(petitionData: CreatePetitionInput): Promise<Petition> {
    const dueDate = this.getDueDate(petitionData.due_date)

    const stmt = this.db.prepare(`
      INSERT INTO petitions (title, description, type, image_url, target_count, location, due_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)

    const result = await stmt
      .bind(
        petitionData.title,
        petitionData.description,
        petitionData.type,
        petitionData.image_url || null,
        petitionData.target_count || 1000,
        petitionData.location || null,
        dueDate,
        petitionData.created_by
      )
      .first<Petition>()

    if (!result) {
      throw new Error('Failed to create petition')
    }

    // Generate and update slug
    const slug = this.generateSlug(petitionData.title, result.id)
    const updateSlugStmt = this.db.prepare('UPDATE petitions SET slug = ? WHERE id = ?')
    await updateSlugStmt.bind(slug, result.id).run()

    // Add categories if provided
    if (petitionData.category_ids && petitionData.category_ids.length > 0) {
      for (const categoryId of petitionData.category_ids) {
        await this.addPetitionCategory(result.id, categoryId)
      }
    }

    // Return updated petition with slug
    return { ...result, slug }
  }

  async getPetitionBySlug(slug: string): Promise<PetitionWithDetails | null> {
    // Get petition with creator info - no expensive JOIN with signatures
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.anonymous as creator_anonymous
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      WHERE p.slug = ?
    `)

    const petition = await stmt.bind(slug).first<
      Petition & {
        creator_first_name: string
        creator_last_name: string
        creator_anonymous: boolean
      }
    >()

    if (!petition) return null

    // Get categories
    const categoriesStmt = this.db.prepare(`
      SELECT c.*
      FROM categories c
      JOIN petition_categories pc ON c.id = pc.category_id
      WHERE pc.petition_id = ?
    `)
    const categoriesResult = await categoriesStmt.bind(petition.id).all<Category>()

    // Use the cached current_count from the petitions table
    return {
      ...petition,
      creator: {
        first_name: petition.creator_first_name,
        last_name: petition.creator_last_name,
        anonymous: petition.creator_anonymous,
      },
      categories: categoriesResult.results || [],
    }
  }

  async getPetitionById(id: number): Promise<PetitionWithDetails | null> {
    // Get petition with creator info - no expensive JOIN with signatures
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.anonymous as creator_anonymous
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `)

    const petition = await stmt.bind(id).first<
      Petition & {
        creator_first_name: string
        creator_last_name: string
        creator_anonymous: boolean
      }
    >()
    if (!petition) return null

    // Get categories
    const categoriesStmt = this.db.prepare(`
      SELECT c.*
      FROM categories c
      JOIN petition_categories pc ON c.id = pc.category_id
      WHERE pc.petition_id = ?
    `)
    const categoriesResult = await categoriesStmt.bind(id).all<Category>()

    // Use the cached current_count from the petitions table
    return {
      ...petition,
      creator: {
        first_name: petition.creator_first_name,
        last_name: petition.creator_last_name,
        anonymous: petition.creator_anonymous,
      },
      categories: categoriesResult.results || [],
    }
  }

  async getAllPetitions(
    limit = 50,
    offset = 0,
    type?: 'local' | 'national'
  ): Promise<PetitionWithDetails[]> {
    // Get petitions with creator info - no expensive JOIN with signatures
    let query = `
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.anonymous as creator_anonymous
      FROM petitions p
      JOIN users u ON p.created_by = u.id
    `

    const params: (string | number)[] = []
    if (type) {
      query += ' WHERE p.type = ?'
      params.push(type)
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all<
      Petition & {
        creator_first_name: string
        creator_last_name: string
        creator_anonymous: boolean
      }
    >()

    if (!result.results) return []

    // Get categories for each petition
    const petitionsWithDetails: PetitionWithDetails[] = []
    for (const petition of result.results) {
      const categoriesStmt = this.db.prepare(`
        SELECT c.*
        FROM categories c
        JOIN petition_categories pc ON c.id = pc.category_id
        WHERE pc.petition_id = ?
      `)
      const categoriesResult = await categoriesStmt.bind(petition.id).all<Category>()

      petitionsWithDetails.push({
        ...petition,
        creator: {
          first_name: petition.creator_first_name,
          last_name: petition.creator_last_name,
          anonymous: petition.creator_anonymous,
        },
        categories: categoriesResult.results || [],
      })
    }

    return petitionsWithDetails
  }

  // Signature methods
  async createSignature(signatureData: CreateSignatureInput): Promise<Signature> {
    const stmt = this.db.prepare(`
      INSERT INTO signatures (petition_id, user_id, comment, anonymous, ip_address)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)

    const result = await stmt
      .bind(
        signatureData.petition_id,
        signatureData.user_id,
        signatureData.comment || null,
        signatureData.anonymous || false,
        signatureData.ip_address || null
      )
      .first<Signature>()

    if (!result) {
      throw new Error('Failed to create signature')
    }

    // Update the cached current_count in the petitions table
    const updateCountStmt = this.db.prepare(`
      UPDATE petitions 
      SET current_count = current_count + 1 
      WHERE id = ?
    `)
    await updateCountStmt.bind(signatureData.petition_id).run()

    return result
  }

  async getUserSignatures(userId: number): Promise<Signature[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM signatures WHERE user_id = ? ORDER BY created_at DESC'
    )
    const result = await stmt.bind(userId).all<Signature>()
    return result.results || []
  }

  async getPetitionSignatures(petitionId: number, limit = 50, offset = 0): Promise<Signature[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM signatures 
      WHERE petition_id = ? AND comment IS NOT NULL AND comment != ''
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    const result = await stmt.bind(petitionId, limit, offset).all<Signature>()
    return result.results || []
  }

  // Category methods
  async createCategory(name: string, description?: string): Promise<Category> {
    const stmt = this.db.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
      RETURNING *
    `)

    const result = await stmt.bind(name, description || null).first<Category>()
    if (!result) {
      throw new Error('Failed to create category')
    }

    return result
  }

  async getAllCategories(): Promise<Category[]> {
    const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name ASC')
    const result = await stmt.all<Category>()
    return result.results || []
  }

  async addPetitionCategory(petitionId: number, categoryId: number): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO petition_categories (petition_id, category_id)
      VALUES (?, ?)
    `)
    await stmt.bind(petitionId, categoryId).run()
  }
}
