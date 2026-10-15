import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK
  const apiKey = process.env.GEMINI_API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Route: AI Embedded Copilot (Code Generation & Advice)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, currentCode, boardName, libraries, taskType } = req.body;

      if (!ai) {
        return res.json({
          success: false,
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
          fallback: generateSmartLocalSuggestion(prompt, currentCode, boardName)
        });
      }

      const systemInstruction = `You are VoltAI, an expert embedded systems engineer, C++/Arduino firmware architect, and electronics specialist for Arduino, ESP32, STM32, RP2040, and Teensy.
Target Hardware Board: ${boardName || 'ESP32 / Arduino'}.
Installed/Available Libraries: ${Array.isArray(libraries) ? libraries.join(', ') : 'Standard MCU libs'}.

Your task is to write clean, production-grade, memory-efficient Arduino C++ firmware.
Follow embedded best practices:
- Always include required headers (<Arduino.h>, <Wire.h>, <WiFi.h>, etc.).
- Define pin numbers as 'const int' or '#define'.
- Handle non-blocking logic with millis() instead of long delay() when appropriate.
- Provide a clear, complete, compilable sketch or code snippet.
- Format code blocks using \`\`\`cpp ... \`\`\`.
- Keep explanations crisp, actionable, and focused on embedded hardware.`;

      const userMessage = currentCode
        ? `Task: ${prompt}\n\nCurrent Editor Code:\n\`\`\`cpp\n${currentCode}\n\`\`\``
        : `Task: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const replyText = response.text || '';
      return res.json({
        success: true,
        reply: replyText,
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.json({
        success: false,
        error: err.message || 'Error communicating with Gemini AI',
        fallback: generateSmartLocalSuggestion(req.body.prompt, req.body.currentCode, req.body.boardName)
      });
    }
  });

  // API Route: AI Fix Compiler Errors
  app.post('/api/ai/fix-code', async (req, res) => {
    try {
      const { code, errorMessage, boardName, file } = req.body;

      if (!ai) {
        return res.json({
          success: false,
          error: 'GEMINI_API_KEY is not configured.',
          fixedCode: code,
          explanation: 'Please check semicolons, matching braces, or missing library includes.'
        });
      }

      const prompt = `Fix this Arduino / C++ microcontroller code that failed compilation.

Target Board: ${boardName || 'Generic MCU'}
File: ${file || 'main.ino'}
Compiler Error Output:
${errorMessage}

Code with error:
\`\`\`cpp
${code}
\`\`\`

Analyze the error carefully. Return:
1. A concise 1-2 sentence explanation of the root cause and fix.
2. The complete corrected code block inside \`\`\`cpp ... \`\`\`. Ensure valid Arduino syntax with matching braces and proper semicolons.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an embedded C++ debugger. Fix syntax, missing braces, incorrect library usage, and type errors.',
          temperature: 0.2,
        },
      });

      const reply = response.text || '';
      // Extract code block
      const codeMatch = reply.match(/```(?:cpp|c\+\+|ino|c)?\n([\s\S]*?)```/);
      const fixedCode = codeMatch ? codeMatch[1].trim() : code;

      return res.json({
        success: true,
        reply,
        fixedCode,
      });
    } catch (err: any) {
      console.error('Gemini Fix Error:', err);
      return res.json({
        success: false,
        error: err.message || 'Error fixing code',
        fixedCode: req.body.code,
      });
    }
  });

  // Vite Middlewares in Dev, Static in Prod
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoltIDE Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateSmartLocalSuggestion(prompt: string, code: string, board: string): string {
  const p = (prompt || '').toLowerCase();
  if (p.includes('wifi') || p.includes('web') || p.includes('server')) {
    return `### ESP32 Wi-Fi Web Server Routine\n\`\`\`cpp\n#include <WiFi.h>\n#include <WebServer.h>\n\nconst char* ssid = "YOUR_SSID";\nconst char* password = "YOUR_PASSWORD";\nWebServer server(80);\n\nvoid handleRoot() {\n  server.send(200, "text/plain", "Hello from VoltIDE on ${board}!");\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println("\\nWiFi Connected! IP: " + WiFi.localIP().toString());\n  server.on("/", handleRoot);\n  server.begin();\n}\n\nvoid loop() {\n  server.handleClient();\n}\n\`\`\``;
  }
  return `### Microcontroller Assistant\n\`\`\`cpp\n// Suggested snippet for ${board}\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}\n\`\`\``;
}

startServer();
