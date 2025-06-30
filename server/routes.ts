import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoService } from "./services/mongodb";
import { extractOrganizationFromEmail } from "./services/openai";
import { insertOrganizationSchema, updateOrganizationSchema } from "@shared/schema";
import { authService } from "./services/auth";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { authenticateToken } from "./middleware/auth";

const extractEmailSchema = z.object({
  emailContent: z.string().min(1, "Email content is required"),
});

// Auth schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await mongoService.connect();

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const { token, userId } = await authService.register({ email, password, name });
      
      res.status(201).json({
        success: true,
        data: { token, userId }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { token, userId } = await authService.login(email, password);
      
      res.json({
        success: true,
        data: { token, userId }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      console.log('GET /api/auth/me - User ID:', req.user.userId);
      const user = await authService.getUser(req.user.userId);
      
      if (!user) {
        console.error('User not found with ID:', req.user.userId);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      console.log('Returning user data for ID:', req.user.userId);
      res.json({ 
        success: true, 
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error: unknown) {
      console.error('Error in GET /api/auth/me:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user data',
        ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
      });
    }
  });

  // Extract organization information from email
  app.post("/api/extract", async (req, res) => {
    try {
      const { emailContent } = extractEmailSchema.parse(req.body);
      
      const extractedData = await extractOrganizationFromEmail(emailContent);
      
      res.json({
        success: true,
        data: {
          ...extractedData,
          emailContent,
        }
      });
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to extract organization information"
      });
    }
  });

  // Create organization
  app.post("/api/organizations", async (req, res) => {
    try {
      const organizationData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(organizationData);
      
      res.status(201).json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error("Create organization error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create organization"
      });
    }
  });

  // Get all organizations
  app.get("/api/organizations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const search = req.query.search as string;
      const industry = req.query.industry as string;

      let organizations;
      if (search || industry) {
        organizations = await storage.searchOrganizations(search || "", industry);
      } else {
        organizations = await storage.getAllOrganizations(limit, skip);
      }

      res.json({
        success: true,
        data: organizations
      });
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch organizations"
      });
    }
  });

  // Get single organization
  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const organization = await storage.getOrganization(id);
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Organization not found"
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error("Get organization error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch organization"
      });
    }
  });

  // Update organization
 app.put("/api/organizations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateOrganizationSchema.parse(req.body);
    const updated = await storage.updateOrganization(id, updateData);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ success: false, message: "Failed to update organization" });
  }
});

  // Delete organization
  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteOrganization(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Organization not found"
        });
      }

      res.json({
        success: true,
        message: "Organization deleted successfully"
      });
    } catch (error) {
      console.error("Delete organization error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete organization"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
