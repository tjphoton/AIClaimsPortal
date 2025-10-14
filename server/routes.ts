import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Initial n8n webhook trigger
  app.post("/api/start-workflow", async (req, res) => {
    try {
      const webhookUrl = "https://n8n-dq6g.onrender.com/webhook-test/2f1d759a-da2d-422a-9c7b-acb647f5823d";

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to start workflow" });
    }
  });

  // Resume workflow with user data
  app.post("/api/resume-workflow", async (req, res) => {
    try {
      const resumeUrl = req.query.resumeUrl as string;

      if (!resumeUrl) {
        return res.status(400).json({ error: "resumeUrl is required" });
      }

      console.log('Resuming workflow at:', resumeUrl);
      console.log('Request body:', req.body);

      const requestContentType = req.headers['content-type'] || '';

      let response;

      // Handle multipart form data (file uploads) differently from JSON
      if (requestContentType.includes('multipart/form-data')) {
        // Stream the request body directly for file uploads
        response = await fetch(resumeUrl, {
          method: 'POST',
          body: req,
          duplex: 'half',
          headers: {
            'Content-Type': requestContentType,
            'Content-Length': req.headers['content-length'] || '0'
          }
        } as any);
      } else {
        // For JSON requests, use the parsed body
        response = await fetch(resumeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body)
        });
      }

      console.log('n8n response status:', response.status);

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('n8n response data:', data);
        res.json(data);
      } else {
        const text = await response.text();
        console.log('n8n response text:', text);
        try {
          const jsonData = JSON.parse(text);
          res.json(jsonData);
        } catch {
          res.json({ message: text });
        }
      }
    } catch (error) {
      console.error('Resume workflow error:', error);
      res.status(500).json({ error: "Failed to resume workflow" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}