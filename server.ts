import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("phonedev.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'python',
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "PhoneDev API is running" });
  });

  // Snippets API
  app.get("/api/snippets", (req, res) => {
    const snippets = db.prepare("SELECT * FROM snippets ORDER BY created_at DESC").all();
    res.json(snippets);
  });

  app.post("/api/snippets", (req, res) => {
    const { title, content, language, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });
    
    const stmt = db.prepare("INSERT INTO snippets (title, content, language, tags) VALUES (?, ?, ?, ?)");
    const info = stmt.run(title, content, language || 'python', tags || '');
    res.json({ id: info.lastInsertRowid, title, content, language, tags });
  });

  app.delete("/api/snippets/:id", (req, res) => {
    db.prepare("DELETE FROM snippets WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Gemini Error Helper
  app.post("/api/debug", async (req, res) => {
    const { errorMessage, context } = req.body;
    if (!errorMessage) return res.status(400).json({ error: "Error message required" });

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || '',
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
        You are a mobile development expert helping a user who codes on Android (Pydroid 3, Termux, Acode).
        
        User's Error Message:
        "${errorMessage}"
        
        Additional Context (e.g. library, OS, environment):
        "${context || 'Mobile Android environment'}"
        
        Please provide:
        1. A simple explanation of why this is happening in a mobile context.
        2. A concise step-by-step fix that works easily on a phone.
        3. If relevant, a code snippet to fix it.
        
        Format the response in clear Markdown.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      res.json({ explanation: result.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to process error message. " + (error.message || '') });
    }
  });

  // Template API (Expanded)
  app.get("/api/templates", (req, res) => {
    res.json([
      { id: "flask", name: "Flask Web App", description: "Minimal Flask setup for Pydroid 3. High performance, light weight.", lang: "python" },
      { id: "fastapi", name: "FastAPI Backend", description: "Modern FastAPI with Uvicorn. Great for mobile APIs.", lang: "python" },
      { id: "htmx", name: "HTML + HTMX", description: "Lightweight dynamic frontend. Zero JS complexity.", lang: "html/htmx" },
      { id: "kivy", name: "Kivy App", description: "Python cross-platform GUI. Build real Android APKs.", lang: "python" },
      { id: "termux-node", name: "Node.js Server", description: "Express.js optimized for Termux environments.", lang: "javascript" }
    ]);
  });

  // Project Generation (Mock / Guidance)
  app.post("/api/generate-project", (req, res) => {
    const { templateId } = req.body;
    const structure: Record<string, string[]> = {
      flask: ["app.py", "templates/index.html", "static/style.css", "requirements.txt"],
      fastapi: ["main.py", "api/routes.py", "models.py", "requirements.txt"],
      htmx: ["index.html", "server.py", "assets/main.js"],
      kivy: ["main.py", "kv/layout.kv", "assets/icon.png", "buildozer.spec"]
    };

    res.json({
      message: `Project structure for ${templateId} generated.`,
      files: structure[templateId] || ["README.md", "main.py"],
      nextSteps: [
        "Create the root directory in your mobile editor.",
        "Initialize a new git repository: git init",
        "Copy-paste the boilerplate into each file."
      ]
    });
  });

  // --- Vite / Build Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
