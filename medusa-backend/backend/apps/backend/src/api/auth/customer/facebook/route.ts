import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { callback_url } = (req.body || {}) as { callback_url?: string };
  
  const clientId = process.env.FACEBOOK_APP_ID || "your_facebook_app_id_here";
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL || "http://localhost:9000/auth/customer/facebook/callback";
  
  const state = callback_url ? Buffer.from(callback_url).toString("base64") : "";

  // Construct Facebook OAuth endpoint
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "email,public_profile",
    response_type: "code",
  });

  const location = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;

  res.status(200).json({ location });
};
