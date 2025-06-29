import { users, organizations, type User, type InsertUser, type Organization, type InsertOrganization, type UpdateOrganization } from "@shared/schema";
import { mongoService } from "./services/mongodb";
import { ObjectId } from "mongodb";
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Organization methods
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | null>;
  getAllOrganizations(limit?: number, skip?: number): Promise<Organization[]>;
  updateOrganization(id: string, updates: UpdateOrganization): Promise<Organization | null>;
  deleteOrganization(id: string): Promise<boolean>;
  searchOrganizations(query: string, industry?: string): Promise<Organization[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Organization methods delegated to MongoDB
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    return await mongoService.createOrganization(org);
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return await mongoService.getOrganization(id);
  }

  async getAllOrganizations(limit = 50, skip = 0): Promise<Organization[]> {
    return await mongoService.getAllOrganizations(limit, skip);
  }

async updateOrganization(id: string, updates: UpdateOrganization): Promise<Organization | null> {
  return await mongoService.updateOrganization(id, updates);
}
  async deleteOrganization(id: string): Promise<boolean> {
    return await mongoService.deleteOrganization(id);
  }

  async searchOrganizations(query: string, industry?: string): Promise<Organization[]> {
    return await mongoService.searchOrganizations(query, industry);
  }
}

export const storage = new MemStorage();
