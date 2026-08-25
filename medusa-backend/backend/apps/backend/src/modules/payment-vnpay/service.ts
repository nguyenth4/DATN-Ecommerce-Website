import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { 
  PaymentSessionStatus,
  InitiatePaymentInput, 
  InitiatePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
  RetrievePaymentInput,
  RetrievePaymentOutput
} from "@medusajs/framework/types"

type VnpayOptions = {
  vnpayHost: string
  tmnCode: string
  secureSecret: string
  testMode?: boolean
  returnUrl: string
}

export default class VnpayProviderService extends AbstractPaymentProvider<VnpayOptions> {
  static identifier = "vnpay"

  protected options_: VnpayOptions
  protected vnpay_: any // Type will be VNPay but we use any to avoid importing the ESM type directly in CJS context without type-only import

  constructor(container: any, options: VnpayOptions) {
    super(container)
    this.options_ = options
  }

  protected async getVnpay() {
    if (!this.vnpay_) {
      const { VNPay } = await import("vnpay")
      this.vnpay_ = new VNPay({
        vnpayHost: this.options_.vnpayHost || 'https://sandbox.vnpayment.vn',
        tmnCode: this.options_.tmnCode,
        secureSecret: this.options_.secureSecret,
        testMode: this.options_.testMode ?? true,
      })
    }
    return this.vnpay_
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context, data } = input
    
    const vnpAmount = Math.round(Number(amount) * 100)
    const tnx = (data?.session_id as string) || `tx_${Date.now()}`
    
    // IP Address might not be easily accessible in all contexts, fallback to loopback
    const ipAddr = '127.0.0.1' 

    const vnpay = await this.getVnpay()

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: vnpAmount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: tnx,
      vnp_OrderInfo: `Thanh toan don hang ${tnx}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.options_.returnUrl,
    })

    return {
      id: tnx,
      data: {
        amount,
        currency_code,
        vnpay_url: paymentUrl,
        vnp_TxnRef: tnx,
      },
      status: "pending" as PaymentSessionStatus
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const initiateResult = await this.initiatePayment({
      amount: input.amount,
      currency_code: input.currency_code,
      context: input.context,
      data: input.data
    })

    return {
      data: initiateResult.data,
      status: initiateResult.status
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {
      data: input.data
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = input.data?.status as string

    if (status === "captured") {
      return { status: "authorized" as PaymentSessionStatus }
    }
    
    if (status === "canceled" || status === "error") {
      return { status: "error" as PaymentSessionStatus }
    }

    return { status: "pending" as PaymentSessionStatus }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "authorized"
      },
      status: "authorized" as PaymentSessionStatus
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return {
      data: input.data
    }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return {
      action: "not_supported",
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "canceled"
      }
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "captured"
      }
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "refunded"
      }
    }
  }
}
