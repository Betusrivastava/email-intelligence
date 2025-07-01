import { MongoClient, Db, Collection,ObjectId, ObjectId as MongoObjectId } from 'mongodb';
import type { Organization, InsertOrganization, UpdateOrganization } from '@shared/schema';

export class MongoDBService {
  private client: MongoClient;
  private db: Db;
  private organizations: Collection;

  constructor() {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb+srv://prachisri068:LvMPaEgy6bzzAMVf@cluster0.6gjts.mongodb.net/email_intelligence?retryWrites=true&w=majority';
    this.client = new MongoClient(mongoUrl);
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('email_intelligence');
      this.organizations = this.db.collection('organizations');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.client.close();
  }

  // Add this method to expose the database instance
  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Helper method to create ObjectId
  getObjectId(id?: string) {
    return id ? new MongoObjectId(id) : new MongoObjectId();
  }

  async createOrganization(org: InsertOrganization): Promise<Organization | null> {
    const result = await this.organizations.insertOne({
      ...org,
      _id: this.getObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const created = await this.organizations.findOne({ _id: result.insertedId });
    return created ? this.transformMongoDoc(created) : null;
  }

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      const organization = await this.organizations.findOne({ _id: this.getObjectId(id) });
      return organization ? this.transformMongoDoc(organization) : null;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  }

  async getAllOrganizations(limit = 50, skip = 0): Promise<Organization[]> {
    const docs = await this.organizations
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
    
    return docs.map(doc => this.transformMongoDoc(doc));
  }

 async updateOrganization(id: string, updates: UpdateOrganization): Promise<Organization | null> {
    try {
      console.log("Updating organization with ID:", id);
      console.log("Updates:", updates);
      
      const result = await this.organizations.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );
      
      console.log("Update result:", result);
      return result ? this.transformMongoDoc(result) : null;
    } catch (error) {
      console.error("MongoDB update error:", error);
      throw error;
    }
  }
  async deleteOrganization(id: string): Promise<boolean> {
    try {
      const result = await this.organizations.deleteOne({ _id: this.getObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  async searchOrganizations(query: string, industry?: string): Promise<Organization[]> {
    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { owners: { $regex: query, $options: 'i' } },
      ];
    }
    
    if (industry && industry !== 'All Industries') {
      filter.industry = industry;
    }

    const docs = await this.organizations
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    return docs.map(doc => this.transformMongoDoc(doc));
  }

  private transformMongoDoc(doc: any): Organization {
    return {
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      owners: doc.owners,
      activities: doc.activities,
      age: doc.age,
      website: doc.website,
      industry: doc.industry,
      attachments: doc.attachments || [],
      emailContent: doc.emailContent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

export const mongoService = new MongoDBService();
