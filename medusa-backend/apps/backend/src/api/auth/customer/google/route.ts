import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { callback_url } = (req.body || {}) as { callback_url?: string };
  
  const clientId = process.env.GOOGLE_CLIENT_ID || "your_google_client_id_here";
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:9000/auth/customer/google/callback";
  
  const state = callback_url ? Buffer.from(callback_url).toString("base64") : "";

  // Construct the Google OAuth endpoint
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const location = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.status(200).json({ location });
};
