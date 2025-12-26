import { Request, Response, Router } from "express";
import { DropboxTokenModel } from "../model/dropboxToken.model";

const router = Router();

const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI


router.get("/start", (req: Request, res: Response): void => {
    try {
        
        if (!CLIENT_ID || !REDIRECT_URI) {
            res.status(500).json({ error: "Dropbox client ID or redirect URI not configured." });
            return;
        }

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: "code",
            token_access_type: "offline",
            redirect_uri: REDIRECT_URI
        });

        const authorizationUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;

        res.redirect(authorizationUrl);

    } catch (error) {
        res.status(500).json({error: `OAuth initialization failed: ${error}`});
    }
});

router.get("/callback", async (req: Request, res: Response): Promise<void> => {

    try {
        const code = req.query.code as string;

        if(!code){
            res.status(400).json({error: "Missing code query parameter"});
            return;
        }

        if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
            res.status(500).json({ error: "Missing DROPBOX_CLIENT_ID or DROPBOX_CLIENT_SECRET or REDIRECT_URI" });
            return;
        }

        const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", REDIRECT_URI);

    const tokenRes = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      res.status(500).json({ error: "Token exchange failed", detail: data });
      return;
    }

    // Calculate expiration time
     const now = Date.now();
    const expires_at = data.expires_in
      ? new Date(now + data.expires_in * 1000 - 30 * 1000) // 30 second buffer
      : null;

    // Save or update token in database
    await DropboxTokenModel.findOneAndUpdate(
      {}, // Find the first (and only) document
      {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at,
        updatedAt: new Date(),
      },
      { upsert: true, new: true } // Create if doesn't exist
    );

    res.send(`
      <html>
        <head><title>Dropbox Authentication Success</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>✓ Dropbox Authentication Successful</h1>
          <p>Tokens have been saved to the database.</p>
          <p><strong>Refresh Token:</strong></p>
          <code style="background: #f0f0f0; padding: 10px; display: block; word-break: break-all;">
            ${data.refresh_token || "N/A"}
          </code>
          <p>You can close this window and return to your application.</p>
        </body>
      </html>
    `);

    } catch (error) {
        console.error("Dropbox callback error:", error);
        res.status(500).json({ error: `Callback failed: ${error}` });
    }

})

export default router;