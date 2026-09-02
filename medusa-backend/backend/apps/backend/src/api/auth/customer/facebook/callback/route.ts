import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import axios from "axios";
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
    } catch {
      const searchParams = new URLSearchParams(params);
      const separator = callbackUrl.includes("?") ? "&" : "?";
      return `${callbackUrl}${separator}${searchParams.toString()}`;
    }
  };

  if (!code) {
    return res.redirect(getRedirectUrl({ error: "missing_code" }));
  }

  const clientId = process.env.FACEBOOK_APP_ID || "your_facebook_app_id_here";
  const clientSecret = process.env.FACEBOOK_APP_SECRET || "your_facebook_app_secret_here";
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL || "http://localhost:9000/auth/customer/facebook/callback";

  try {
    // 1. Get Access Token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        client_id: clientId,
        redirect_uri: redirectUri,
        client_secret: clientSecret,
        code,
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Get User Profile data
    const profileResponse = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        fields: 'id,first_name,last_name,email',
        access_token: accessToken
      }
    });

    const userData = profileResponse.data;
    const email = userData.email;
    const first_name = userData.first_name || "";
    const last_name = userData.last_name || "";

    if (!email) {
      return res.redirect(getRedirectUrl({ error: "missing_email" }));
    }

    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    
    // 3. Find or create customer
    let customers = await customerModuleService.listCustomers({ email: [email] });
    let customer;

    if (customers.length === 0) {
      customer = await customerModuleService.createCustomers({
        email,
        first_name,
        last_name,
        has_account: true,
      });
    } else {
      customer = customers[0];
    }

    // 4. Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    
    const token = jwt.sign(
      {
        actor_id: customer.id,
        actor_type: "customer",
        auth_identity_id: `facebook_${userData.id}` 
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // 5. Redirect back to frontend while preserving existing callback parameters.
    res.redirect(getRedirectUrl({ token, _type: "facebook" }));

  } catch (error: any) {
    console.error("Facebook OAuth error:", error?.response?.data || error);
    res.redirect(getRedirectUrl({ error: "server_error" }));
  }
};
