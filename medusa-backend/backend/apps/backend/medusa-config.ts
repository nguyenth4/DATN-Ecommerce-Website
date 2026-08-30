import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: {
        ssl: {
          rejectUnauthorized: false
        }
      },
      pool: {
        min: 0,
        max: 2,
        idleTimeoutMillis: 5000,
        createTimeoutMillis: 8000,
        acquireConnectionTimeoutMillis: 8000
      }
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: {
    // ── Auth Module — Email/Password + Google OAuth + Facebook OAuth ──────────
    auth: {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          // Email + Password (mặc định — đã hoạt động)
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          // Google OAuth
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL
                ?? "http://localhost:9000/auth/customer/google/callback",
            },
          },
          // Facebook OAuth (custom provider)
          {
            resolve: "./src/modules/auth-providers/facebook",
            id: "facebook",
            options: {
              clientId: process.env.FACEBOOK_APP_ID,
              clientSecret: process.env.FACEBOOK_APP_SECRET,
              callbackUrl: process.env.FACEBOOK_CALLBACK_URL
                ?? "http://localhost:9000/auth/customer/facebook/callback",
            },
          },
        ],
      },
    },
    // ── File Storage (S3 / Supabase) ─────────────────────────────────────────
    file: {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    // ── Custom Wallet Module ──────────────────────────────────────────────────
    "wallet": {
      resolve: "./src/modules/wallet",
    },
    fulfillment: {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/modules/ghn-fulfillment",
            id: "ghn",
          },
          {
            resolve: "./src/modules/ghtk-fulfillment",
            id: "ghtk",
          },
        ],
      },
    },
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-vnpay",
            id: "vnpay",
            options: {
              vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
              tmnCode: process.env.VNPAY_TMN_CODE || 'VNPAY_TMN_CODE_PLACEHOLDER',
              secureSecret: process.env.VNPAY_SECURE_SECRET || 'VNPAY_SECURE_SECRET_PLACEHOLDER',
              returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/checkout/vnpay_return',
            }
          }
        ]
      }
    },
    recommendationModuleService: {
      resolve: "./src/modules/recommendation",
    }
  }
})

