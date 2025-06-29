import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoService } from "./services/mongodb";
import { extractOrganizationFromEmail } from "./services/openai";
import { insertOrganizationSchema, updateOrganizationSchema } from "@shared/schema";
import { z } from "zod";

const extractEmailSchema = z.object({
  emailContent: z.string().min(1, "Email content is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await mongoService.connect();

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
      const updates = updateOrganizationSchema.parse(req.body);
      
      const organization = await storage.updateOrganization(id, updates);
      
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
      console.error("Update organization error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update organization"
      });
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
