import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import axios from "axios"

type GhnFulfillmentOptions = {
  api_token: string;
  shop_id: string;
  api_url: string;
}

export default class GhnFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "ghn"

  protected logger_: Logger
  protected options_: GhnFulfillmentOptions

  constructor({ logger }: { logger: Logger }, options: GhnFulfillmentOptions) {
    super()
    this.logger_ = logger
    this.options_ = options

    // Fallback nếu người dùng cấu hình thiếu trong medusa-config.ts
    if (!this.options_.api_token) {
      this.options_.api_token = process.env.GHN_API_TOKEN as string;
    }
    if (!this.options_.shop_id) {
      this.options_.shop_id = process.env.GHN_SHOP_ID as string;
    }
    if (!this.options_.api_url) {
      this.options_.api_url = process.env.GHN_API_URL as string;
    }
  }

  getIdentifier(): string {
    return GhnFulfillmentProviderService.identifier
  }

  // Khai báo các gói dịch vụ hiển thị cho người dùng
  async getFulfillmentOptions(): Promise<any[]> {
    return [
      { id: "ghn-standard", name: "Giao Hàng Nhanh (Tiêu Chuẩn)", service_type_id: 2, is_return: false },
      { id: "ghn-heavy", name: "Giao Hàng Nhanh (Hàng Nặng)", service_type_id: 5, is_return: false }
    ]
  }

  async validateFulfillmentData(optionData: any, data: any, context: any): Promise<any> {
    return { ...data }
  }

  async validateOption(data: any): Promise<boolean> {
    return true
  }

  async canCalculate(data: any): Promise<boolean> {
    return true
  }

  // Hàm tính toán chi phí vận chuyển
  async calculatePrice(optionData: any, data: any, context: any): Promise<number> {
    try {
      // Trong V2, context chứa thông tin giỏ hàng và địa chỉ
      const to_district_id = context.shipping_address?.metadata?.district_id;
      const to_ward_code = context.shipping_address?.metadata?.ward_code;

      if (!to_district_id || !to_ward_code) {
        return 0; // Chưa có địa chỉ không thể tính
      }

      let totalWeight = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let sumHeight = 0;

      // Map dữ liệu items
      const ghnItems = (context.items || []).map((item: any) => {
        const weight = item.variant?.weight || 200;
        const length = item.variant?.length || 10;
        const width = item.variant?.width || 10;
        const height = item.variant?.height || 5;

        totalWeight += weight * item.quantity;
        if (length > maxLength) maxLength = length;
        if (width > maxWidth) maxWidth = width;
        sumHeight += height * item.quantity;

        return {
          name: item.title,
          quantity: item.quantity,
          weight: weight,
          length: length,
          width: width,
          height: height
        }
      });

      const payload = {
        service_type_id: optionData.service_type_id || 2,
        to_district_id: parseInt(to_district_id),
        to_ward_code: to_ward_code,
        weight: totalWeight > 0 ? totalWeight : 1000,
        length: maxLength > 0 ? maxLength : 20,
        width: maxWidth > 0 ? maxWidth : 20,
        height: sumHeight > 0 ? sumHeight : 10,
        insurance_value: context.total || 0,
        items: ghnItems.length > 0 ? ghnItems : [{ name: "Hàng Hóa", quantity: 1, weight: 1000, length: 20, width: 20, height: 10 }]
      };

      const response = await axios.post(`${this.options_.api_url}/shipping-order/fee`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Token': this.options_.api_token,
          'ShopId': this.options_.shop_id
        }
      });

      if (response.data && response.data.code === 200) {
        // Trả về số tiền (chú ý: nếu bạn lưu tiền ở dạng Cents (x100) thì nhân 100)
        // GHN trả về VNĐ, nếu giỏ hàng Medusa dùng tiền nguyên thì return thẳng
        return response.data.data.total;
      }

      return 0;
    } catch (error: any) {
      this.logger_.error(`[GHN] Lỗi tính phí: ${error.response?.data?.message || error.message}`);
      // Fallback giá mặc định nếu GHN lỗi để khách hàng vẫn checkout được
      return 30000;
    }
  }

  // Medusa V2 yêu cầu các hàm này cho quá trình Fulfillment (Giao hàng)
  async createFulfillment(data: any, items: any, order: any, fulfillment: any): Promise<any> {
    // API tạo đơn hàng (Create Order) gọi ở đây
    return {}
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    // API hủy đơn (Cancel Order) gọi ở đây
    return {}
  }
  
  async createReturnFulfillment(fulfillment: any): Promise<any> {
    return {}
  }
}
