import { FulfillmentService } from "@medusajs/medusa"
import axios from "axios"

class GhnFulfillmentService extends FulfillmentService {
  static identifier = "ghn"
  
  apiToken: string
  shopId: string
  apiUrl: string

  constructor(container, options) {
    super(container)
    // Lấy config từ options (medusa-config.js) hoặc biến môi trường
    this.apiToken = options.api_token || process.env.GHN_API_TOKEN
    this.shopId = options.shop_id || process.env.GHN_SHOP_ID
    this.apiUrl = options.api_url || process.env.GHN_API_URL
  }

  async calculatePrice(optionData, data, cart) {
    try {
      const shippingAddress = cart.shipping_address
      
      // Lấy id quận/huyện và mã phường/xã từ metadata của address
      const to_district_id = shippingAddress.metadata?.district_id
      const to_ward_code = shippingAddress.metadata?.ward_code

      if (!to_district_id || !to_ward_code) {
         // Chưa có địa chỉ giao hàng thì chưa tính phí được
         return 0; 
      }

      // --- BƯỚC 1: MAP DỮ LIỆU TỪ MEDUSA ITEMS SANG GHN ITEMS ---
      let totalWeight = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let sumHeight = 0;

      const ghnItems = cart.items.map(item => {
        // Fallback: Đề phòng Admin không nhập kích thước sản phẩm
        const weight = item.variant.weight || 200; // Mặc định 200g
        const length = item.variant.length || 10;  // Mặc định 10cm
        const width = item.variant.width || 10;
        const height = item.variant.height || 5;

        // Tính toán thông số cho hộp đóng gói tổng (dành cho Hàng nhẹ)
        totalWeight += weight * item.quantity;
        if (length > maxLength) maxLength = length;
        if (width > maxWidth) maxWidth = width;
        sumHeight += (height * item.quantity); // Giả định xếp chồng các hộp lên nhau

        return {
          name: item.title,
          quantity: item.quantity,
          weight: weight,
          length: length,
          width: width,
          height: height
        }
      });

      // --- BƯỚC 2: CHUẨN BỊ PAYLOAD CHUẨN GHN ---
      const payload = {
        service_type_id: optionData.service_type_id, // Lấy ID 2 hoặc 5 từ option khách chọn
        to_district_id: parseInt(to_district_id),
        to_ward_code: to_ward_code,
        // Thông số outer (Dùng khi tính phí Hàng nhẹ)
        weight: totalWeight,
        length: maxLength,
        width: maxWidth,
        height: sumHeight,
        insurance_value: cart.total || 0, 
        // Thông số inner (Dùng khi tính phí Hàng nặng)
        items: ghnItems 
      };

      // --- BƯỚC 3: GỌI API GHN ---
      const response = await axios.post(`${this.apiUrl}/shipping-order/fee`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Token': this.apiToken,
          'ShopId': this.shopId
        }
      });

      if (response.data.code === 200) {
        return response.data.data.total; // Trả về số tiền cho Medusa
      }
      
      return 0;
      
    } catch (error) {
      console.error("[GHN Fulfillment] Lỗi tính phí:", error.response?.data || error.message);
      throw new Error("Không thể tính phí giao hàng qua Giao Hàng Nhanh lúc này.");
    }
  }

  // Khai báo 2 phương thức vận chuyển để khách chọn trên Frontend
  async getFulfillmentOptions() {
    return [
      { 
        id: "ghn-standard", 
        name: "Giao Hàng Nhanh (Hàng Nhẹ)", 
        service_type_id: 2 
      },
      { 
        id: "ghn-heavy", 
        name: "Giao Hàng Nhanh (Hàng Nặng)", 
        service_type_id: 5 
      },
    ]
  }

  async validateFulfillmentData(optionData, data, cart) { 
    return data 
  }
  
  async validateOption(data) { 
    return true 
  }
  
  async canCalculate(data) { 
    return true 
  }
  
  async createFulfillment(data, items, order, fulfillment) { 
    // Nơi bạn sẽ gọi API Create Order của GHN sau này
    return {} 
  }
  
  async cancelFulfillment(fulfillment) { 
    return {} 
  }
}

export default GhnFulfillmentService
