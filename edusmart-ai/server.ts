import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const APP_URL = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'http://localhost:3000';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${APP_URL}/auth/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents'
];

// API Routes
app.get("/api/auth/url", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ url: authUrl });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    // In a real app, you'd store this in a database or session
    // For this demo, we'll send it back to the client via postMessage
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                tokens: ${JSON.stringify(tokens)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

app.post("/api/sheets/append", async (req, res) => {
  const { spreadsheetId, tokens, values, sheetName = 'Sheet1' } = req.body;
  
  if (!tokens || !spreadsheetId) {
    return res.status(400).json({ error: 'Missing tokens or spreadsheet ID' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials(tokens);
    const sheets = google.sheets({ version: 'v4', auth });

    // Ensure sheet exists
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });
    } catch (error: any) {
      if (error.code === 404 || (error.message && error.message.includes('range'))) {
        // Sheet might not exist, try to create it
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: { title: sheetName }
                }
              }]
            }
          });
        } catch (createError: any) {
          // If it already exists but range was the issue, ignore
          if (!createError.message.includes('already exists')) {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const hasData = response.data.values && response.data.values.length > 0;

    if (!hasData) {
      // Define headers based on sheetName
      let headers: string[] = [];
      if (sheetName === 'Modul Ajar') {
        headers = ['Timestamp', 'Mata Pelajaran', 'Fase', 'Topik', 'Tujuan', 'Metode', 'Konten (Preview)'];
      } else if (sheetName === 'Proyek P5') {
        headers = ['Timestamp', 'Tema', 'Durasi', 'Dimensi', 'Konten (Preview)'];
      }

      if (headers.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers]
          }
        });
      }
    }
    
    const range = `${sheetName}!A1`;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values]
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error appending to sheet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/docs/append", async (req, res) => {
  const { documentId, tokens, content, title } = req.body;
  
  console.log(`Attempting to append to Google Doc: ${documentId}`);
  
  if (!tokens || !documentId) {
    console.error('Missing tokens or document ID');
    return res.status(400).json({ error: 'Missing tokens or document ID' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials(tokens);
    const docs = google.docs({ version: 'v1', auth });

    console.log('Sending batchUpdate request to Google Docs API...');
    // Append content to the end of the document
    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              endOfSegmentLocation: {},
              text: `\n\n--- ${title} (${new Date().toLocaleString('id-ID')}) ---\n\n${content}\n`
            }
          }
        ]
      }
    });
    console.log('Google Docs API response:', response.status, response.statusText);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error appending to doc:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
