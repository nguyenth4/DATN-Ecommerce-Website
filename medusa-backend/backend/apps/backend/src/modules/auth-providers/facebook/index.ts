import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types";
import crypto from "crypto";

// ── Types ──────────────────────────────────────────────────────────────────
type FacebookAuthOptions = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

type InjectedDependencies = {
  logger: Logger;
};

// ── Facebook Graph API URLs ────────────────────────────────────────────────
const FB_DIALOG_URL = "https://www.facebook.com/v19.0/dialog/oauth";
const FB_TOKEN_URL  = "https://graph.facebook.com/v19.0/oauth/access_token";
const FB_ME_URL     = "https://graph.facebook.com/me";

// ─────────────────────────────────────────────────────────────────────────────
// FacebookAuthService — custom provider cho Medusa v2 Auth Module
// Implements 3 methods bắt buộc:
//   - authenticate: tạo redirect URL → Facebook OAuth dialog
//   - validateCallback: exchange code → access_token → fetch user profile
//   - register: không hỗ trợ (dùng authenticate thay)
// ─────────────────────────────────────────────────────────────────────────────
export class FacebookAuthService extends AbstractAuthModuleProvider {
  static identifier  = "facebook";
  static DISPLAY_NAME = "Facebook Authentication";

  protected config_: FacebookAuthOptions;
  protected logger_: Logger;

  static validateOptions(options: Record<string, unknown>) {
    if (!options.clientId) {
      throw new Error("Facebook clientId (App ID) is required");
    }
    if (!options.clientSecret) {
      throw new Error("Facebook clientSecret (App Secret) is required");
    }
    if (!options.callbackUrl) {
      throw new Error("Facebook callbackUrl is required");
    }
  }

  constructor(
    { logger }: InjectedDependencies,
    options: FacebookAuthOptions
  ) {
    // @ts-ignore — Medusa base constructor pattern
    super(...arguments);
    this.config_ = options;
    this.logger_  = logger;
  }

  // ── register — Facebook không hỗ trợ tạo tài khoản riêng ─────────────────
  async register(_: AuthenticationInput): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Facebook does not support registration. Use `authenticate` instead."
    );
  }

  // ── authenticate — tạo redirect URL đến Facebook OAuth ───────────────────
  async authenticate(
    req: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const body = req.body ?? {};

    if ((req.query as any)?.error) {
      const q = req.query as any;
      return {
        success: false,
        error: `${q.error_description ?? q.error}`,
      };
    }

    // Tạo state ngẫu nhiên để chống CSRF
    const stateKey = crypto.randomBytes(32).toString("hex");
    const callbackUrl = body?.callback_url ?? this.config_.callbackUrl;

    await authIdentityService.setState(stateKey, { callback_url: callbackUrl });

    const authUrl = new URL(FB_DIALOG_URL);
    authUrl.searchParams.set("client_id",     this.config_.clientId);
    authUrl.searchParams.set("redirect_uri",  callbackUrl);
    authUrl.searchParams.set("scope",         "email,public_profile");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state",         stateKey);

    return { success: true, location: authUrl.toString() };
  }

  // ── validateCallback — nhận code từ FB, exchange lấy token + user info ────
  async validateCallback(
    req: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const query = req.query as Record<string, string> ?? {};
    const body  = req.body  ?? {};

    // Facebook trả error qua query param
    if (query.error) {
      return {
        success: false,
        error: `${query.error_description ?? query.error}`,
      };
    }

    const code = query.code ?? body.code;
    if (!code) {
      return { success: false, error: "No code provided" };
    }

    // Verify state (chống CSRF)
    const state = await authIdentityService.getState(query.state);
    if (!state) {
      return { success: false, error: "No state provided, or session expired" };
    }

    try {
      // Step 1: exchange code → access_token
      const tokenParams = new URLSearchParams({
        client_id:     this.config_.clientId,
        client_secret: this.config_.clientSecret,
        redirect_uri:  state.callback_url as string,
        code,
      });

      const tokenRes = await fetch(
        `${FB_TOKEN_URL}?${tokenParams.toString()}`
      );
      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        return { success: false, error: `Facebook token exchange failed: ${err}` };
      }
      const { access_token } = await tokenRes.json() as { access_token: string };

      // Step 2: lấy thông tin user từ Graph API
      const meParams = new URLSearchParams({
        access_token,
        fields: "id,name,email,first_name,last_name,picture.type(large)",
      });
      const meRes = await fetch(`${FB_ME_URL}?${meParams.toString()}`);
      if (!meRes.ok) {
        const err = await meRes.text();
        return { success: false, error: `Facebook profile fetch failed: ${err}` };
      }
      const profile = await meRes.json() as {
        id:          string;
        name:        string;
        email?:      string;
        first_name?: string;
        last_name?:  string;
        picture?:    { data: { url: string } };
      };

      if (!profile.id) {
        return { success: false, error: "Could not retrieve Facebook user ID" };
      }

      const entity_id   = `facebook_${profile.id}`;
      const userMetadata = {
        provider_id: profile.id,
        name:        profile.name,
        email:       profile.email,
        first_name:  profile.first_name,
        last_name:   profile.last_name,
        picture:     profile.picture?.data?.url,
      };

      // Step 3: tạo hoặc lấy authIdentity
      let authIdentity: any;
      try {
        authIdentity = await authIdentityService.retrieve({ entity_id });
      } catch (error: any) {
        if (error.type === MedusaError.Types.NOT_FOUND) {
          authIdentity = await authIdentityService.create({
            entity_id,
            user_metadata: userMetadata,
          });
        } else {
          return { success: false, error: error.message };
        }
      }

      return { success: true, authIdentity };
    } catch (error: any) {
      this.logger_.error(`[FacebookAuth] validateCallback error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

import { ModuleProvider } from "@medusajs/framework/utils";

export default ModuleProvider("facebook", {
  services: [FacebookAuthService],
});
