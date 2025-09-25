// SERVER-ONLY DATABASE SERVICE - DO NOT IMPORT IN CLIENT CODE
// This file should only be used in Cloudflare functions

/// <reference types="@cloudflare/workers-types" />

import {
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

  // Petition methods
  async createPetition(petitionData: CreatePetitionInput): Promise<Petition> {
    const stmt = this.db.prepare(`
      INSERT INTO petitions (title, description, type, image_url, target_count, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
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
        petitionData.created_by
      )
      .first<Petition>()

    if (!result) {
      throw new Error('Failed to create petition')
    }

    // Add categories if provided
    if (petitionData.category_ids && petitionData.category_ids.length > 0) {
      for (const categoryId of petitionData.category_ids) {
        await this.addPetitionCategory(result.id, categoryId)
      }
    }

    return result
  }

  async getPetitionById(id: number): Promise<PetitionWithDetails | null> {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.anonymous as creator_anonymous,
        COUNT(s.id) as signature_count
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      LEFT JOIN signatures s ON p.id = s.petition_id
      WHERE p.id = ?
      GROUP BY p.id
    `)

    const petition = await stmt.bind(id).first<any>()
    if (!petition) return null

    // Get categories
    const categoriesStmt = this.db.prepare(`
      SELECT c.*
      FROM categories c
      JOIN petition_categories pc ON c.id = pc.category_id
      WHERE pc.petition_id = ?
    `)
    const categoriesResult = await categoriesStmt.bind(id).all<Category>()

    return {
      ...petition,
      creator: {
        first_name: petition.creator_first_name,
        last_name: petition.creator_last_name,
        anonymous: petition.creator_anonymous,
      },
      categories: categoriesResult.results || [],
      signature_count: petition.signature_count || 0,
    }
  }

  async getAllPetitions(
    limit = 50,
    offset = 0,
    type?: 'local' | 'national'
  ): Promise<PetitionWithDetails[]> {
    let query = `
      SELECT 
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.anonymous as creator_anonymous,
        COUNT(s.id) as signature_count
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      LEFT JOIN signatures s ON p.id = s.petition_id
    `

    const params: any[] = []
    if (type) {
      query += ' WHERE p.type = ?'
      params.push(type)
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all<any>()

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
        signature_count: petition.signature_count || 0,
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
      WHERE petition_id = ? 
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
