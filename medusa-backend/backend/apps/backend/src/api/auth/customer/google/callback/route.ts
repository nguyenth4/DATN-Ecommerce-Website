import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  const callbackUrl = state ? Buffer.from(state, "base64").toString("utf-8") : "http://localhost:5173/auth/callback";
  
  const getRedirectUrl = (params: Record<string, string>) => {
    try {
      const url = new URL(callbackUrl);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      return url.toString();
    } catch (e) {
      // Fallback if callbackUrl is not a valid absolute URL
      const searchParams = new URLSearchParams(params);
      const separator = callbackUrl.includes("?") ? "&" : "?";
      return `${callbackUrl}${separator}${searchParams.toString()}`;
    }
  };

  if (!code) {
    return res.redirect(getRedirectUrl({ error: "missing_code" }));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "your_google_client_id_here";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "your_google_client_secret_here";
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:9000/auth/customer/google/callback";

  try {
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user info directly using google auth library
    const userInfoResponse = await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });
    
    const userData = userInfoResponse.data as any;
    const email = userData.email;
    const first_name = userData.given_name || "";
    const last_name = userData.family_name || "";
    const picture = userData.picture || "";

    if (!email) {
      return res.redirect(getRedirectUrl({ error: "missing_email" }));
    }

    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    
    // Find or create customer
    let customers = await customerModuleService.listCustomers({ email: [email] });
    let customer;

    if (customers.length === 0) {
      customer = await customerModuleService.createCustomers({
        email,
        first_name,
        last_name,
        has_account: true,
        metadata: {
          avatar_url: picture,
        },
      });
    } else {
      customer = customers[0];
    }

    // Always ensure avatar_url in database metadata is updated with Google profile photo if available
    if (picture && customer) {
      try {
        const db = req.scope.resolve("__pg_connection__");
        await db.raw(`
          UPDATE customer 
          SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
          WHERE id = ?
        `, [JSON.stringify({ avatar_url: picture }), customer.id]);

        customer.metadata = { ...(customer.metadata || {}), avatar_url: picture };
        customer.avatar_url = picture;
      } catch (err) {
        console.error("[Google OAuth Callback] Error updating customer metadata with avatar_url:", err);
      }
    }

    // Generate JWT token matching Medusa V2's standard structure
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    
    const token = jwt.sign(
      {
        actor_id: customer.id,
        actor_type: "customer",
        auth_identity_id: `google_${userData.id}`,
        user_metadata: {
          email,
          first_name,
          last_name,
          picture,
        }
      },
      jwtSecret,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Redirect to frontend with token and provider type
    res.redirect(getRedirectUrl({ token, _type: "google" }));

  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(getRedirectUrl({ error: "server_error" }));
  }
};
