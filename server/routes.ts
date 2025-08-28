import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Tools endpoints
  app.get("/api/tools", (req, res) => {
    // Return mock tools or from storage
    res.json({
      tools: [],
      total: 0,
    });
  });

  app.get("/api/tools/:id", (req, res) => {
    const { id } = req.params;
    // Return specific tool or 404
    res.status(404).json({ error: "Tool not found" });
  });

  app.post("/api/tools", (req, res) => {
    // Create new tool
    const { name, description, spec } = req.body;
    
    if (!name || !spec) {
      return res.status(400).json({ error: "Name and spec are required" });
    }

    const tool = {
      id: `tool_${Date.now()}`,
      name,
      description,
      spec,
      createdAt: new Date().toISOString(),
      public: false,
    };

    res.status(201).json(tool);
  });

  // User favorites
  app.get("/api/favorites", (req, res) => {
    res.json({ favorites: [] });
  });

  app.post("/api/favorites", (req, res) => {
    const { toolId } = req.body;
    if (!toolId) {
      return res.status(400).json({ error: "Tool ID is required" });
    }
    res.status(201).json({ message: "Added to favorites" });
  });

  app.delete("/api/favorites/:toolId", (req, res) => {
    const { toolId } = req.params;
    res.json({ message: "Removed from favorites" });
  });

  // Search endpoint
  app.get("/api/search", (req, res) => {
    const { q, category, sort } = req.query;
    res.json({
      results: [],
      total: 0,
      query: q,
      filters: { category, sort },
    });
  });

  // Analytics endpoints (placeholder)
  app.post("/api/analytics/tool-run", (req, res) => {
    const { toolId, duration } = req.body;
    // Log tool run analytics
    res.json({ recorded: true });
  });

  app.post("/api/analytics/tool-view", (req, res) => {
    const { toolId } = req.body;
    // Log tool view analytics
    res.json({ recorded: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
