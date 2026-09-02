import { useState, useEffect, useMemo, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import "../styles/account.css";
import "../styles/order-tracking.css";
import {
  Camera,
  User,
  Receipt,
  MapPin,
  Heart,
  Lock,
  LogOut,
  CheckCircle,
  Check,
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { useProducts } from "../services/product.service";
import { walletService } from "../services/wallet.service";
import { authService } from "../services/auth.service";
import { getWishlist } from "../utils/wishlist";
import ProductCard from "../components/ProductCard";

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

// Mock Orders Data
const MOCK_ORDERS: any[] = [];

// Read real orders from localStorage
const getRealOrders = () => {
  try {
    return JSON.parse(localStorage.getItem("sprylo_orders") || "[]") as any[];
  } catch {
    return [];
  }
};

const formatOrderId = (id: string) => {
  if (!id) return "";
  return id.replace(/^order_/, "");
};

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParamsQ] = useSearchParams();

  // Đọc ?tab= từ URL để tự động mở tab đúng (ví dụ: /account?tab=orders từ VNPayReturnPage)
  const initialTab = (() => {
    const t = searchParamsQ.get("tab");
    const valid = [
      "profile",
      "orders",
      "addresses",
      "wishlist",
      "wallet",
      "password",
      "policies",
    ];
    return valid.includes(t || "") ? (t as any) : "profile";
  })();

  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "orders"
    | "addresses"
    | "wishlist"
    | "wallet"
    | "password"
    | "policies"
  >(initialTab);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [realOrders, setRealOrders] = useState(getRealOrders);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null,
  );
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // ─── Review States ──────────────────────────────────────────────────────────
  // reviewState: map productId -> { rating, comment, loading, done, error }
  const [reviewState, setReviewState] = useState<Record<string, {
    rating: number;
    comment: string;
    loading: boolean;
    done: boolean;
    error: string;
  }>>({});

  // Lấy danh sách product đã được review từ localStorage
  const getReviewedProducts = (): string[] => {
    try { return JSON.parse(localStorage.getItem("sprylo_reviewed_products") || "[]"); }
    catch { return []; }
  };

  const markProductReviewed = (productId: string) => {
    const list = getReviewedProducts();
    if (!list.includes(productId)) {
      localStorage.setItem("sprylo_reviewed_products", JSON.stringify([...list, productId]));
    }
  };

  const handleSubmitReview = async (
    productId: string,
    productName: string,
    orderId?: string
  ) => {
    const state = reviewState[productId] || { rating: 5, comment: "", loading: false, done: false, error: "" };
    if (!state.comment.trim() || state.comment.trim().replace(/\s+/g, "").length < 10) {
      setReviewState(prev => ({ ...prev, [productId]: { ...state, error: "Vui lòng nhập ít nhất 10 ký tự cho bình luận." } }));
      return;
    }
    setReviewState(prev => ({ ...prev, [productId]: { ...state, loading: true, error: "" } }));

    const info = localStorage.getItem("customer_info");
    let custId = "";
    try { if (info) custId = JSON.parse(info).id; } catch {}
    const token = localStorage.getItem("customer_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-publishable-api-key": (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_test",
      "x-customer-id": custId,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId || selectedOrderId || undefined,
          rating: state.rating,
          comment: state.comment.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setReviewState(prev => ({ ...prev, [productId]: { ...state, loading: false, done: true, error: "" } }));
        markProductReviewed(productId);
      } else {
        setReviewState(prev => ({ ...prev, [productId]: { ...state, loading: false, error: data.message || "Gửi đánh giá thất bại." } }));
      }
    } catch {
      setReviewState(prev => ({ ...prev, [productId]: { ...state, loading: false, error: "Lỗi kết nối máy chủ." } }));
    }
  };

  // Dynamic badge helpers for orders
  const getOrderFulfillmentBadgeClass = (order: any) => {
    if (order.canceled || order.status === "canceled")
      return "status-badge badge-cancelled";

    const customStatus = order.metadata?.custom_status;
    if (customStatus) {
      if (customStatus === "pending") return "status-badge badge-pending";
      if (customStatus === "confirmed") return "status-badge badge-pending";
      if (customStatus === "preparing") return "status-badge badge-packed";
      if (customStatus === "shipping") return "status-badge badge-shipped";
      if (customStatus === "delivered" || customStatus === "completed")
        return "status-badge badge-delivered";
      if (customStatus === "canceled") return "status-badge badge-cancelled";
      if (customStatus === "refunded") return "status-badge badge-cancelled";
    }

    if (order.status === "completed") return "status-badge badge-delivered";

    switch (order.fulfillment_status) {
      case "shipped":
      case "partially_shipped":
        return "status-badge badge-shipped";
      case "fulfilled":
      case "partially_fulfilled":
        return "status-badge badge-packed";
      default:
        return "status-badge badge-pending";
    }
  };

  const getOrderFulfillmentBadgeIcon = (order: any) => {
    if (order.canceled || order.status === "canceled")
      return "bi bi-x-circle-fill";

    const customStatus = order.metadata?.custom_status;
    if (customStatus) {
      if (customStatus === "pending") return "bi bi-clock-history";
      if (customStatus === "confirmed") return "bi bi-check-circle";
      if (customStatus === "preparing") return "bi bi-box-seam";
      if (customStatus === "shipping") return "bi bi-truck";
      if (customStatus === "delivered" || customStatus === "completed")
        return "bi bi-check-circle-fill";
      if (customStatus === "canceled") return "bi bi-x-circle-fill";
      if (customStatus === "refunded") return "bi bi-arrow-return-left";
    }

    if (order.status === "completed") return "bi bi-check-circle-fill";

    switch (order.fulfillment_status) {
      case "shipped":
      case "partially_shipped":
        return "bi bi-truck";
      case "fulfilled":
      case "partially_fulfilled":
        return "bi bi-box-seam";
      default:
        return "bi bi-clock-history";
    }
  };

  const getOrderFulfillmentBadgeText = (order: any) => {
    if (order.canceled || order.status === "canceled") return "Đã hủy";

    const customStatus = order.metadata?.custom_status;
    if (customStatus) {
      if (customStatus === "pending") return "Chờ xác nhận";
      if (customStatus === "confirmed") return "Đã xác nhận";
      if (customStatus === "preparing") return "Đóng gói hàng";
      if (customStatus === "shipping") return "Đang giao";
      if (customStatus === "delivered" || customStatus === "completed")
        return "Đã nhận";
      if (customStatus === "canceled") return "Đã hủy";
      if (customStatus === "refunded") return "Đã hoàn tiền";
    }

    if (order.status === "completed") return "Đã nhận";

    switch (order.fulfillment_status) {
      case "shipped":
      case "partially_shipped":
        return "Đang giao";
      case "fulfilled":
      case "partially_fulfilled":
        return "Đã đóng gói";
      default:
        return "Chờ xác nhận";
    }
  };

  const syncOrders = async () => {
    try {
      const token = localStorage.getItem("customer_token");
      if (!token) return;

      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders?limit=50&fields=id,display_id,status,fulfillment_status,payment_status,metadata,created_at,items.title,items.thumbnail,items.variant_title,items.unit_price,items.quantity,shipping_address.*`,
      );
      if (response.ok) {
        const { orders } = await response.json();
        if (orders && Array.isArray(orders)) {
          const localOrders = getRealOrders();

          const remoteMapped = orders.map((o: any) => {
            const items = (o.items || []).map((item: any) => ({
              name: item.title || item.product_title || "Sản phẩm",
              variant: item.variant_title || "",
              qty: item.quantity,
              price: item.unit_price,
              img: item.thumbnail || "",
            }));

            const sa = o.shipping_address || {};
            const fullName =
              [sa.first_name, sa.last_name].filter(Boolean).join(" ") ||
              o.metadata?.full_name ||
              "Khách Hàng";
            const phoneNumber = sa.phone || o.metadata?.phone || "";
            const addressParts = [
              sa.address_1,
              sa.address_2,
              sa.city,
              sa.province,
            ].filter((part) => part && part.trim() !== "");
            const address =
              addressParts.join(", ") || o.metadata?.address || "";

            return {
              orderId: o.id,
              display_id: o.display_id,
              status: o.status,
              fulfillment_status: o.fulfillment_status,
              payment_status: o.payment_status,
              metadata: o.metadata,
              items,
              customer: {
                fullName,
                phoneNumber,
              },
              address,
              paymentMethod: o.metadata?.payment_method || "cod",
              shippingMethod: o.metadata?.shipping_method || "ghn",
              shippingFee: Number(o.metadata?.shipping_fee || 35000),
              created_at: new Date(o.created_at).getTime(),
              canceled: o.status === "canceled",
              cancelReason: o.metadata?.cancel_reason || "",
            };
          });

          const merged = [...localOrders];
          remoteMapped.forEach((remoteOrder: any) => {
            const idx = merged.findIndex(
              (o) =>
                o.orderId === remoteOrder.orderId ||
                (remoteOrder.metadata?.external_id &&
                  remoteOrder.metadata.external_id === o.orderId),
            );

            if (idx > -1) {
              merged[idx] = {
                ...merged[idx],
                ...remoteOrder,
                // Giữ nguyên mã đơn hàng từ Medusa (orderId, display_id) thay vì mã tạm 1788...
                orderId: remoteOrder.orderId,
                cancelReason:
                  remoteOrder.status === "canceled"
                    ? remoteOrder.cancelReason ||
                      merged[idx].cancelReason ||
                      "Hệ thống/Cửa hàng hủy"
                    : merged[idx].cancelReason,
              };
            } else {
              merged.push(remoteOrder);
            }
          });

          // Sort by created_at DESC
          merged.sort((a, b) => b.created_at - a.created_at);

          localStorage.setItem("sprylo_orders", JSON.stringify(merged));
          setRealOrders(merged);
        }
      }
    } catch (err) {
      console.error("Failed to sync orders from backend:", err);
    }
  };

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Nam");
  const [dob, setDob] = useState("1998-05-15");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<{
    old?: string;
    new?: string;
    confirm?: string;
  }>({});

  // Password strength checker
  const getPasswordStrength = (
    pwd: string,
  ): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: "Rất yếu", color: "var(--rose)" };
    if (score === 2) return { score, label: "Yếu", color: "#f97316" };
    if (score === 3) return { score, label: "Trung bình", color: "#eab308" };
    if (score === 4) return { score, label: "Mạnh", color: "#22c55e" };
    return { score, label: "Rất mạnh", color: "#10b981" };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess(false);
    const fieldErrors: { old?: string; new?: string; confirm?: string } = {};

    if (!oldPassword) fieldErrors.old = "Vui lòng nhập mật khẩu hiện tại";
    if (!newPassword || newPassword.length < 8)
      fieldErrors.new = "Mật khẩu mới phải có ít nhất 8 ký tự";
    if (newPassword === oldPassword)
      fieldErrors.new = "Mật khẩu mới phải khác mật khẩu hiện tại";
    if (newPassword !== confirmNewPassword)
      fieldErrors.confirm = "Mật khẩu xác nhận không khớp";

    if (Object.keys(fieldErrors).length > 0) {
      setPwFieldErrors(fieldErrors);
      return;
    }
    setPwFieldErrors({});
    setPwLoading(true);

    try {
      // Call custom secure password change endpoint
      const updateRes = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/custom/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        },
      );

      if (!updateRes.ok) {
        const body = await updateRes.json().catch(() => ({}));
        const msg =
          body?.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.";
        if (msg.includes("Mật khẩu hiện tại không đúng")) {
          setPwFieldErrors({ old: "Mật khẩu hiện tại không đúng" });
        } else {
          setPwError(msg);
        }
        setPwLoading(false);
        return;
      }

      // Success — clear form
      setPwSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPwSuccess(false), 5000);
    } catch {
      setPwError("Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setPwLoading(false);
    }
  };

  // Fetch profile on mount & address states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrCompany, setAddrCompany] = useState("Nhà riêng");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Fetch profile function
  const fetchProfile = async () => {
    try {
      const res = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/customers/me?fields=*addresses`,
      );
      if (res.ok) {
        const { customer } = await res.json();
        if (customer) {
          setCustomerId(customer.id);
          setFirstName(customer.first_name || "");
          setLastName(customer.last_name || "");
          setEmail(customer.email || "");
          setPhone(customer.phone || "");
          setGender(customer.metadata?.gender || "Nam");
          setDob(customer.metadata?.dob || "1998-05-15");
          setAvatarUrl(customer.metadata?.avatar_url || "");
          setAddresses(customer.addresses || []);

          // cache user details
          localStorage.setItem(
            "customer_info",
            JSON.stringify({
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
              avatar_url: customer.metadata?.avatar_url || "",
              gender: customer.metadata?.gender || "Nam",
              dob: customer.metadata?.dob || "1998-05-15",
            }),
          );
        }
      } else if (res.status === 401) {
        // Handled by authFetch logging out
        navigate("/login", { state: { from: location } });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    syncOrders();
    try {
      const orders = JSON.parse(
        localStorage.getItem("sprylo_orders") || "[]",
      ) as any[];
      const filtered = orders.filter(
        (o) => o.orderId !== "order_01KZVAZ2QRBPQC89BH2WV0Q26",
      );
      if (orders.length !== filtered.length) {
        localStorage.setItem("sprylo_orders", JSON.stringify(filtered));
        setRealOrders(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [navigate, activeTab]);

  // Fetch Provinces on mount (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    fetch("/api/cas/address-kit/2025-07-01/provinces")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.provinces || (Array.isArray(data) ? data : []);
        setProvinces(list.map((p: any) => ({ id: p.code, name: p.name })));
      })
      .catch((err) =>
        console.error("Error fetching provinces from AddressKit:", err),
      );
  }, []);

  // Fetch Wards/Communes when Province changes (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    if (selectedProvince) {
      fetch(
        `/api/cas/address-kit/2025-07-01/provinces/${selectedProvince}/communes`,
      )
        .then((res) => res.json())
        .then((data) => {
          const list = data?.communes || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setWards(list.map((c: any) => ({ id: c.code, name: c.name })));
            setDistricts([{ id: "default", name: "Toàn khu vực" }]);
            setSelectedDistrict("default");
          } else {
            setWards([]);
            setDistricts([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching communes from AddressKit:", err);
          setWards([]);
          setDistricts([]);
        });
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  const handleAddClick = () => {
    setEditingAddress(null);
    setAddrFullName("");
    setAddrPhone("");
    setAddrDetail("");
    setAddrCompany("Nhà riêng");
    setAddrIsDefault(addresses.length === 0);
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    setShowAddressModal(true);
  };

  const handleEditClick = async (addr: any) => {
    setEditingAddress(addr);
    setAddrFullName(`${addr.first_name || ""} ${addr.last_name || ""}`.trim());
    setAddrPhone(addr.phone || "");
    setAddrDetail(addr.address_1 || "");
    setAddrCompany(addr.company || "Nhà riêng");
    setAddrIsDefault(addr.is_default_shipping || false);

    const provinceId = addr.metadata?.province_id || "";
    const wardId = addr.metadata?.ward_id || "";

    setSelectedProvince(provinceId);

    if (provinceId) {
      try {
        const wardRes = await fetch(
          `/api/cas/address-kit/2025-07-01/provinces/${provinceId}/communes`,
        );
        const wardData = await wardRes.json();
        const list =
          wardData?.communes || (Array.isArray(wardData) ? wardData : []);
        if (list.length > 0) {
          setWards(list.map((c: any) => ({ id: c.code, name: c.name })));
          setDistricts([{ id: "default", name: "Toàn khu vực" }]);
          setSelectedDistrict("default");
          setSelectedWard(wardId);
        }
      } catch (err) {
        console.error("Error populating location lists for edit:", err);
      }
    }

    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (
      !addrFullName.trim() ||
      !addrPhone.trim() ||
      !addrDetail.trim() ||
      !selectedProvince ||
      !selectedWard
    ) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    const provinceName =
      provinces.find((p) => p.id === selectedProvince)?.name || "";
    const districtName =
      districts.find((d) => d.id === selectedDistrict)?.name || "";
    const wardName = wards.find((w) => w.id === selectedWard)?.name || "";

    const nameParts = addrFullName.trim().split(" ");
    const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const addressPayload = {
      first_name: firstName || addrFullName,
      last_name: lastName || "",
      phone: addrPhone,
      address_1: addrDetail,
      address_2: wardName,
      city: districtName,
      province: provinceName,
      postal_code: "100000",
      country_code: "vn",
      company: addrCompany,
      is_default_shipping: addrIsDefault,
      metadata: {
        province_id: selectedProvince,
        district_id: selectedDistrict,
        ward_id: selectedWard,
      },
    };

    try {
      let url = `${MEDUSA_BACKEND_URL}/store/customers/me/addresses`;
      let method = "POST";

      if (editingAddress) {
        url = `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${editingAddress.id}`;
      }

      const res = await authService.authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressPayload),
      });

      if (res.ok) {
        setShowAddressModal(false);
        fetchProfile();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Không thể lưu địa chỉ.");
      }
    } catch (err) {
      console.error("Save address error:", err);
      alert("Đã xảy ra lỗi kết nối với máy chủ.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      const res = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        fetchProfile();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Không thể xóa địa chỉ.");
      }
    } catch (err) {
      console.error("Delete address error:", err);
      alert("Đã xảy ra lỗi kết nối với máy chủ.");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_default_shipping: true,
          }),
        },
      );

      if (res.ok) {
        fetchProfile();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Không thể đặt làm mặc định.");
      }
    } catch (err) {
      console.error("Set default address error:", err);
      alert("Đã xảy ra lỗi kết nối với máy chủ.");
    }
  };

  useEffect(() => {
    if (activeTab === "wallet") {
      const targetCusId = customerId || "cus_demo_123";
      walletService
        .getWallet(targetCusId)
        .then((res) => setWalletData(res.wallet))
        .catch(console.error);
    }
  }, [activeTab, customerId]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());

  // Listen to wishlist updates to sync state
  useEffect(() => {
    const handleUpdate = () => {
      setWishlistIds(getWishlist());
    };
    window.addEventListener("wishlist-updated", handleUpdate);
    return () => {
      window.removeEventListener("wishlist-updated", handleUpdate);
    };
  }, []);

  // Fetch product data from Medusa/fallback mock data for wishlist items
  const { data: productsData, isLoading: isWishlistLoading } = useProducts(
    wishlistIds.length > 0 ? { id: wishlistIds, limit: 10 } : undefined,
  );

  const wishlistProducts = useMemo(() => {
    if (wishlistIds.length === 0 || !productsData?.products) return [];
    return wishlistIds
      .map((id) => productsData.products.find((p: any) => p.id === id))
      .filter(Boolean);
  }, [productsData, wishlistIds]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước tệp tin không được vượt quá 5MB.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await authService.authFetch(
          `${MEDUSA_BACKEND_URL}/store/custom/upload-avatar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              avatar: base64Data,
            }),
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);

            const cached = localStorage.getItem("customer_info");
            if (cached) {
              const customer = JSON.parse(cached);
              customer.avatar_url = data.avatar_url;
              localStorage.setItem("customer_info", JSON.stringify(customer));
            }

            window.dispatchEvent(new Event("customer-auth-change"));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data?.message || "Tải lên ảnh thất bại.");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        alert("Có lỗi xảy ra khi đọc tệp tin.");
        setUploading(false);
      };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết nối với máy chủ.");
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/custom/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            email: email,
            gender: gender,
            dob: dob,
          }),
        },
      );
      if (res.ok) {
        const { customer } = await res.json();
        setSaveSuccess(true);
        localStorage.setItem(
          "customer_info",
          JSON.stringify({
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            avatar_url: customer.metadata?.avatar_url || "",
            gender: customer.metadata?.gender || "Nam",
            dob: customer.metadata?.dob || "1998-05-15",
          }),
        );
        window.dispatchEvent(new Event("customer-auth-change"));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleCancelProfile = () => {
    const cached = localStorage.getItem("customer_info");
    if (cached) {
      const customer = JSON.parse(cached);
      setFirstName(customer.first_name || "");
      setLastName(customer.last_name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setGender(customer.gender || "Nam");
      setDob(customer.dob || "1998-05-15");
      setAvatarUrl(customer.avatar_url || "");
    }
  };

  const selectedRealOrder = realOrders.find(
    (o) => o.orderId === selectedOrderId,
  );
  const selectedMockOrder = MOCK_ORDERS.find((o) => o.id === selectedOrderId);

  const getDynamicStatusStep = (order: any) => {
    if (order.canceled || order.status === "canceled") return -1;

    // Check custom metadata status first
    const customStatus = order.metadata?.custom_status;
    if (customStatus) {
      if (customStatus === "pending") return 0;
      if (customStatus === "confirmed") return 1;
      if (customStatus === "preparing") return 2;
      if (customStatus === "shipping") return 3;
      if (customStatus === "delivered" || customStatus === "completed")
        return 4;
      if (customStatus === "refunded") return 5;
    }

    if (order.status === "completed") return 4;

    return 0;
  };

  // Cancel is only allowed before shipping starts (pending/confirmed/preparing)
  const canCancelOrder = (order: any) => {
    if (order.canceled || order.status === "canceled") return false;
    const step = getDynamicStatusStep(order);
    return step >= 0 && step < 3;
  };

  // Return is allowed when order is delivered and no return is currently requested
  const canReturnOrder = (order: any) => {
    if (order.canceled || order.status === 'canceled') return false;
    const step = getDynamicStatusStep(order);
    return step === 4 && !order.metadata?.return_requested;
  };

  const [returnModalOrderId, setReturnModalOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Hàng lỗi / Không hoạt động');
  const [customReturnReason, setCustomReturnReason] = useState<string>('');
  
  // Refund info state
  const [refundDestination, setRefundDestination] = useState<'wallet' | 'bank_transfer'>('wallet');
  const [refundBankName, setRefundBankName] = useState<string>('');
  const [refundAccountNumber, setRefundAccountNumber] = useState<string>('');
  const [refundAccountName, setRefundAccountName] = useState<string>('');
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  
  const [banks, setBanks] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(data => {
        if (data.code === "00") setBanks(data.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (refundDestination === 'bank_transfer' && refundBankName && refundAccountNumber && refundAccountNumber.length >= 5) {
      const timer = setTimeout(async () => {
        setIsLookingUp(true);
        try {
          const res = await fetch('https://api.vietqr.io/v2/lookup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': 'e3568c07-fc2a-4de1-8a90-8edc4e09fa84',
              'x-api-key': '059bb29d-ee65-4f7f-ac90-1c3fc4bc98a0',
            },
            body: JSON.stringify({
              bin: refundBankName,
              accountNumber: refundAccountNumber
            })
          });
          const data = await res.json();
          if (data.code === "00") {
            setRefundAccountName(data.data.accountName);
          } else {
            setRefundAccountName("NGUYEN VAN DEMO");
          }
        } catch(e) {
          setRefundAccountName("NGUYEN VAN DEMO");
        } finally {
          setIsLookingUp(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [refundBankName, refundAccountNumber, refundDestination]);

  const getCancelBlockedReason = (order: any) => {
    if (order.canceled || order.status === "canceled") return null;
    const step = getDynamicStatusStep(order);
    if (step === 3) return "Đơn hàng đang giao, không thể hủy";
    if (step >= 4) return "Đơn hàng đã hoàn thành";
    return null;
  };

  // Check if order can be confirmed as received by the customer
  const canConfirmReceipt = (order: any) => {
    if (!order) return false;
    if (order.canceled || order.status === "canceled") return false;
    if (order.status === "completed") return false;

    const customStatus = order.metadata?.custom_status;
    const fulfillmentStatus = order.fulfillment_status;
    const step = getDynamicStatusStep(order);

    return (
      step >= 2 ||
      customStatus === "preparing" ||
      customStatus === "shipping" ||
      customStatus === "delivered" ||
      fulfillmentStatus === "fulfilled" ||
      fulfillmentStatus === "shipped" ||
      fulfillmentStatus === "partially_shipped"
    );
  };

  const getShippingProviderInfo = (order: any, trackingNum?: string | null) => {
    const tracking = (
      trackingNum ||
      (order as any)?.fulfillments?.[0]?.tracking_numbers?.[0]
        ?.tracking_number ||
      (order as any)?.fulfillments?.[0]?.tracking_numbers?.[0] ||
      (order as any)?.trackingNumber ||
      order?.metadata?.tracking_number ||
      order?.metadata?.tracking_code ||
      ""
    )
      .toString()
      .trim();

    const rawProvider = (
      order?.metadata?.shipping_provider ||
      order?.metadata?.shipping_method ||
      order?.shipping_provider ||
      order?.shippingMethod ||
      order?.fulfillments?.[0]?.provider_id ||
      ""
    )
      .toString()
      .toLowerCase();

    const trackingUpper = tracking.toUpperCase();

    if (
      trackingUpper.startsWith("GHTK") ||
      rawProvider.includes("ghtk") ||
      rawProvider.includes("tiết kiệm")
    ) {
      return {
        id: "ghtk",
        name: "GHTK",
        fullName: "Giao Hàng Tiết Kiệm",
        label: "MÃ VẬN ĐƠN (GHTK)",
        buttonText: "Theo dõi trên GHTK",
        trackingUrl: tracking
          ? `https://i.ghtk.vn/${tracking}`
          : "https://i.ghtk.vn",
      };
    }

    return {
      id: "ghn",
      name: "GHN",
      fullName: "Giao Hàng Nhanh",
      label: "MÃ VẬN ĐƠN (GHN)",
      buttonText: "Theo dõi trên GHN",
      trackingUrl: tracking
        ? `https://donhang.ghn.vn/?order_code=${tracking}`
        : "https://donhang.ghn.vn",
    };
  };


  const getDynamicTimeline = (order: any) => {
    const timeline = [];
    const dateStr = new Date(order.created_at).toLocaleString("vi-VN");

    timeline.push({
      time: dateStr,
      desc: "Đã đặt hàng",
      sub: "Chờ xác nhận từ cửa hàng",
      done: true,
    });

    const step = getDynamicStatusStep(order);

    if (step >= 1) {
      const confirmedTime = order.metadata?.confirmed_at
        ? new Date(order.metadata.confirmed_at).toLocaleString("vi-VN")
        : dateStr;
      timeline.push({
        time: confirmedTime,
        desc: "Đã xác nhận",
        sub: "Cửa hàng đã xác nhận đơn hàng của bạn",
        done: true,
      });
    }

    if (step >= 2) {
      const preparingTime = order.metadata?.preparing_at
        ? new Date(order.metadata.preparing_at).toLocaleString("vi-VN")
        : dateStr;
      timeline.push({
        time: preparingTime,
        desc: "Đóng gói hàng",
        sub: "Sản phẩm đã được đóng gói và chuẩn bị gửi đi",
        done: true,
      });
    }

    if (step >= 3) {
      const providerInfo = getShippingProviderInfo(
        order,
        order.metadata?.tracking_number || order.metadata?.tracking_code,
      );
      const provider = providerInfo.fullName || providerInfo.name;
      const trackingCode =
        order.metadata?.tracking_number ||
        order.metadata?.tracking_code ||
        (order as any).trackingNumber;
      const tracking = trackingCode ? ` (Mã vận đơn: ${trackingCode})` : "";
      const shippedTime = order.metadata?.shipped_at
        ? new Date(order.metadata.shipped_at).toLocaleString("vi-VN")
        : dateStr;
      timeline.push({
        time: shippedTime,
        desc: "Đang giao hàng",
        sub: `Đơn hàng đang được giao bởi đơn vị vận chuyển ${provider}${tracking}`,
        done: true,
      });
    }

    if (step >= 4) {
      const deliveredTime = order.metadata?.delivered_at
        ? new Date(order.metadata.delivered_at).toLocaleString("vi-VN")
        : order.updated_at
          ? new Date(order.updated_at).toLocaleString("vi-VN")
          : dateStr;
      timeline.push({
        time: deliveredTime,
        desc: "Đã nhận",
        sub: "Đơn hàng giao thành công",
        done: true,
      });
    }

    if (order.canceled || order.status === "canceled") {
      const canceledTime = order.metadata?.canceled_at
        ? new Date(order.metadata.canceled_at).toLocaleString("vi-VN")
        : order.canceled_at
          ? new Date(order.canceled_at).toLocaleString("vi-VN")
          : order.updated_at
            ? new Date(order.updated_at).toLocaleString("vi-VN")
            : dateStr;
      timeline.push({
        time: canceledTime,
        desc: "Đã hủy đơn hàng",
        sub: `Lý do: ${order.cancelReason || order.metadata?.cancel_reason || "Hệ thống/Cửa hàng hủy"}`,
        done: true,
      });
    }

    return timeline;
  };

  const selectedOrder = selectedRealOrder
    ? {
        id: selectedRealOrder.orderId,
        display_id: selectedRealOrder.display_id || null,
        date: new Date(selectedRealOrder.created_at).toLocaleString("vi-VN"),
        total:
          selectedRealOrder.items.reduce(
            (s: number, i: any) => s + ((i as any).price || 0) * i.qty,
            0,
          ) + (selectedRealOrder.shippingFee || 35000),
        shippingFee: selectedRealOrder.shippingFee || 35000,
        paymentStatus:
          selectedRealOrder.payment_status === "captured" ||
          selectedRealOrder.payment_status === "paid" ||
          selectedRealOrder.metadata?.payment_status === "paid"
            ? "Đã thanh toán"
            : "Chưa thanh toán",
        shippingStatus: getOrderFulfillmentBadgeText(selectedRealOrder),
        shippingAddress: {
          name: selectedRealOrder.customer?.fullName || "Khách Hàng",
          phone: selectedRealOrder.customer?.phoneNumber || "0000000000",
          address: selectedRealOrder.address || "Địa chỉ mặc định",
        },
        paymentMethod:
          selectedRealOrder.paymentMethod === "cod"
            ? "COD (Thanh toán khi nhận hàng)"
            : selectedRealOrder.paymentMethod === "wallet"
              ? "Ví điện tử Sprylo"
              : selectedRealOrder.paymentMethod === "zalopay"
                ? "ZaloPay"
                : selectedRealOrder.paymentMethod === "momo"
                  ? "MoMo"
                  : selectedRealOrder.paymentMethod === "vnpay"
                    ? "VNPay"
                    : selectedRealOrder.paymentMethod || "VNPay",
        items: selectedRealOrder.items.map((item: any) => ({
          name: item.title || item.name || "Sản phẩm",
          title: item.title || item.name || "Sản phẩm",
          variant: item.variant?.title || item.variant || "",
          quantity: item.qty || item.quantity,
          price: item.unit_price || item.price || 0,
          product_id: item.product_id || item.productId || item.variant?.product_id || item.id || (item.title ? `prod_${item.title}` : `prod_${item.name}`),
          thumbnail: item.thumbnail || item.img || null,
          image:
            item.thumbnail ||
            item.img ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80",
        })),
        timeline: getDynamicTimeline(selectedRealOrder),
        statusStep: getDynamicStatusStep(selectedRealOrder),
        trackingNumber:
          (selectedRealOrder as any).fulfillments?.[0]?.tracking_numbers?.[0]
            ?.tracking_number ||
          (selectedRealOrder as any).fulfillments?.[0]?.tracking_numbers?.[0] ||
          (selectedRealOrder as any).trackingNumber ||
          selectedRealOrder.metadata?.tracking_number ||
          selectedRealOrder.metadata?.tracking_code ||
          null,
      }
    : selectedMockOrder
      ? {
          ...selectedMockOrder,
          display_id: selectedMockOrder.id,
          shippingFee: 30000,
          trackingNumber: (selectedMockOrder as any).trackingNumber || null,
        }
      : null;

  const handleConfirmReceipt = async (orderId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn đã nhận được hàng và hài lòng với sản phẩm?",
      )
    )
      return;
    setConfirmingOrderId(orderId);
    try {
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/confirm-receipt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (response.ok) {
        const updated = realOrders.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                status: "completed",
                payment_status: "captured",
                metadata: {
                  ...(o.metadata || {}),
                  custom_status: "completed",
                  delivered_at:
                    o.metadata?.delivered_at || new Date().toISOString(),
                },
              }
            : o,
        );
        localStorage.setItem("sprylo_orders", JSON.stringify(updated));
        setRealOrders(updated);
        await syncOrders();
        alert(
          "Đã xác nhận nhận hàng thành công. Bạn có thể đánh giá sản phẩm ngay bây giờ!",
        );
      } else {
        const data = await response.json().catch(() => ({}));
        alert(
          data.message ||
            data.error ||
            "Xác nhận nhận hàng thất bại. Vui lòng thử lại.",
        );
      }
    } catch (err) {
      console.error("Confirm receipt error:", err);
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  // Cancel a real order and restore inventory
  const handleCancelOrder = async (orderId: string, reason: string) => {
    setCancelingOrderId(orderId);
    try {
      const order = realOrders.find((o) => o.orderId === orderId);
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: order?.items || [] }),
        },
      );
      if (response.ok) {
        // Mark order as canceled in localStorage
        const updated = realOrders.map((o) =>
          o.orderId === orderId
            ? { ...o, canceled: true, status: "canceled", cancelReason: reason }
            : o,
        );
        localStorage.setItem("sprylo_orders", JSON.stringify(updated));
        setRealOrders(updated);
        setSelectedOrderId(null);
        setCancelModalOrderId(null);
        alert("Đơn hàng đã được hủy thành công.");
      } else {
        alert("Hủy đơn hàng thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Lỗi kết nối máy chủ khi hủy đơn hàng.");
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handleReturnOrder = async (
    orderId: string,
    reason: string,
    refund_info: string = "",
    refund_destination: "wallet" | "bank_transfer" = "wallet",
  ) => {
    setReturningOrderId(orderId);
    try {
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/request-return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, refund_info, refund_destination }),
        },
      );
      if (response.ok) {
        const updated = realOrders.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                metadata: {
                  ...o.metadata,
                  return_requested: true,
                  return_reason: reason,
                  refund_info,
                  refund_destination,
                },
              }
            : o,
        );
        localStorage.setItem("sprylo_orders", JSON.stringify(updated));
        setRealOrders(updated);
        setReturnModalOrderId(null);
        setRefundDestination("wallet");
        setRefundBankName("");
        setRefundAccountNumber("");
        setRefundAccountName("");
        alert("Yêu cầu trả hàng đã được gửi thành công.");
      } else {
        const error = await response.json();
        alert("Gửi yêu cầu thất bại: " + (error.error || "Vui lòng thử lại."));
      }
    } catch (err) {
      console.error("Return order error:", err);
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setReturningOrderId(null);
    }
  };

  const handleTopupSubmit = async () => {
    if (!topupAmount || isNaN(Number(topupAmount)) || Number(topupAmount) < 10000) {
      alert("Vui lòng nhập số tiền hợp lệ (tối thiểu 10.000đ).");
      return;
    }
    
    setTopupLoading(true);
    try {
      const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/wallet/topup/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(topupAmount), customer_id: customerId })
      });
      
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || data.error || "Lỗi tạo giao dịch nạp tiền.");
      }
    } catch (e: any) {
      alert("Lỗi kết nối: " + e.message);
    } finally {
      setTopupLoading(false);
      setShowTopupModal(false);
    }
  };
  const getShippingBadgeClass = (status: string) => {
    switch (status) {
      case "Đang giao":
        return "status-badge badge-shipped";
      case "Đã nhận":
        return "status-badge badge-completed";
      case "Đã hủy":
        return "status-badge badge-cancelled";
      default:
        return "status-badge badge-pending";
    }
  };

  const getShippingBadgeIcon = (status: string) => {
    switch (status) {
      case "Đang giao":
        return "bi bi-truck";
      case "Đã nhận":
        return "bi bi-check-circle-fill";
      case "Đã hủy":
        return "bi bi-x-circle-fill";
      default:
        return "bi bi-clock-history";
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Tài khoản</span>
          </div>
          <h1>TÀI KHOẢN CỦA TÔI</h1>
        </div>
      </div>

      <section className="section products-section-bg">
        <div className="container">
          <div className="account-layout">
            {/* SIDEBAR */}
            <div className="account-sidebar">
              <div className="account-profile-header">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
                <div
                  className="avatar-wrap"
                  onClick={handleAvatarClick}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="avatar-img"
                    style={{
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {uploading ? (
                      <div
                        className="avatar-spinner"
                        style={{
                          animation: "spin 1s linear infinite",
                          border: "3px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                        }}
                      ></div>
                    ) : avatarUrl ? (
                      <img
                        src={
                          avatarUrl.startsWith("/") ? `${avatarUrl}` : avatarUrl
                        }
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : firstName || lastName ? (
                      `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`
                    ) : (
                      <User size={28} />
                    )}
                  </div>
                  <div className="avatar-edit">
                    <Camera size={14} />
                  </div>
                </div>
                <div className="account-name">
                  {lastName} {firstName}
                </div>
                <div className="account-email">{email}</div>
              </div>
              <div style={{ padding: "0.5rem 0" }}>
                <div
                  className={`account-nav-item ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    setSelectedOrderId(null);
                  }}
                >
                  <User size={18} style={{ marginRight: "12px" }} /> Thông tin
                  cá nhân
                </div>
                <div
                  className={`account-nav-item ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setSelectedOrderId(null);
                  }}
                >
                  <Receipt size={18} style={{ marginRight: "12px" }} /> Đơn hàng
                  của tôi
                  {realOrders.length > 0 && (
                    <span
                      className="badge-count"
                      style={{
                        marginLeft: "auto",
                        position: "static",
                        background: "var(--indigo)",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {realOrders.length}
                    </span>
                  )}
                </div>
                <div
                  className={`account-nav-item ${activeTab === "addresses" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("addresses");
                    setSelectedOrderId(null);
                  }}
                >
                  <MapPin size={18} style={{ marginRight: "12px" }} /> Địa chỉ
                  giao hàng
                </div>
                <div
                  className={`account-nav-item ${activeTab === "wishlist" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("wishlist");
                    setSelectedOrderId(null);
                  }}
                >
                  <Heart size={18} style={{ marginRight: "12px" }} /> Sản phẩm
                  yêu thích
                </div>
                <div
                  className={`account-nav-item ${activeTab === "wallet" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("wallet");
                    setSelectedOrderId(null);
                  }}
                >
                  <Wallet size={18} style={{ marginRight: "12px" }} /> Ví điện
                  tử Sprylo
                </div>
                <div
                  className={`account-nav-item ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("password");
                    setSelectedOrderId(null);
                  }}
                >
                  <Lock size={18} style={{ marginRight: "12px" }} /> Đổi mật
                  khẩu
                </div>
                <div
                  className={`account-nav-item ${activeTab === "policies" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("policies");
                    setSelectedOrderId(null);
                  }}
                >
                  <CheckCircle size={18} style={{ marginRight: "12px" }} /> Quản
                  lý chính sách (Seller)
                </div>
                <div className="account-nav-divider"></div>
                <Link
                  to="#"
                  className="account-nav-item text-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    authService.logout();
                  }}
                >
                  <LogOut size={18} style={{ marginRight: "12px" }} /> Đăng xuất
                </Link>
              </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="tab-panel active">
                  <div
                    style={{
                      background: "white",
                      borderRadius: "var(--r-lg)",
                      border: "1px solid var(--rule)",
                      padding: "1.8rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--ff-display)",
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        marginBottom: "1.5rem",
                        paddingBottom: "0.8rem",
                        borderBottom: "1px solid var(--rule)",
                      }}
                    >
                      Thông tin cá nhân
                    </div>

                    {saveSuccess && (
                      <div
                        className="alert alert-success"
                        style={{ marginBottom: "1.5rem" }}
                      >
                        <CheckCircle size={16} /> Cập nhật thông tin cá nhân
                        thành công!
                      </div>
                    )}

                    <div
                      className="alert alert-info"
                      style={{
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle size={16} /> Tài khoản đã xác thực email
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Họ *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tên *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Giới tính</label>
                        <select
                          className="form-control"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ngày sinh</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                    <div
                      className="flex-center"
                      style={{
                        justifyContent: "flex-end",
                        gap: "0.8rem",
                        marginTop: "1.8rem",
                      }}
                    >
                      <button
                        className="btn btn--ghost"
                        onClick={handleCancelProfile}
                      >
                        Hủy thay đổi
                      </button>
                      <button
                        className="btn btn--indigo"
                        onClick={handleSaveProfile}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Check size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="tab-panel active">
                  {!selectedOrderId ? (
                    // Orders List View
                    <div
                      style={{
                        background: "white",
                        borderRadius: "var(--r-lg)",
                        border: "1px solid var(--rule)",
                        padding: "1.8rem",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--ff-display)",
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          paddingBottom: "0.8rem",
                          borderBottom: "1px solid var(--rule)",
                        }}
                      >
                        Đơn hàng của tôi
                      </div>

                      <div style={{ overflowX: "auto" }}>
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Mã đơn hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng cộng</th>
                              <th>Thanh toán</th>
                              <th>Vận chuyển</th>
                              <th style={{ textAlign: "right" }}>Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Real orders from localStorage */}
                            {realOrders.map((order) => (
                              <tr
                                key={order.orderId}
                                style={{ opacity: order.canceled ? 0.6 : 1 }}
                              >
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--ink)",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  #
                                  {order.display_id ||
                                    formatOrderId(order.orderId)}
                                </td>
                                 <td>
                                  {new Date(
                                    order.created_at,
                                  ).toLocaleDateString("vi-VN")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--indigo)",
                                  }}
                                >
                                  {formatPrice(
                                    order.items.reduce(
                                      (s: number, i: any) =>
                                        s + ((i as any).price || 0) * i.qty,
                                      0,
                                    ) + (order.shippingFee || 35000),
                                  )}
                                </td>
                                <td>
                                  {order.payment_status === "captured" ||
                                  order.payment_status === "paid" ||
                                  order.status === "completed" ? (
                                    <span className="status-badge badge-completed">
                                      <i className="bi bi-check-circle-fill"></i>{" "}
                                      Đã thanh toán
                                    </span>
                                  ) : (
                                    <span className="status-badge badge-pending">
                                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
                                      Chưa thanh toán
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={getOrderFulfillmentBadgeClass(
                                      order,
                                    )}
                                  >
                                    <i
                                      className={getOrderFulfillmentBadgeIcon(
                                        order,
                                      )}
                                    ></i>{" "}
                                    {getOrderFulfillmentBadgeText(order)}
                                  </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.5rem",
                                      justifyContent: "flex-end",
                                      alignItems: "center",
                                    }}
                                  >
                                    {canConfirmReceipt(order) && (
                                      <button
                                        className="btn-order-action btn-order-confirm"
                                        onClick={() =>
                                          handleConfirmReceipt(order.orderId)
                                        }
                                        disabled={
                                          confirmingOrderId === order.orderId
                                        }
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                          color: "#fff",
                                          border: "none",
                                          padding: "0.35rem 0.75rem",
                                          borderRadius: "6px",
                                          fontWeight: 600,
                                          fontSize: "0.75rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.35rem",
                                          cursor: "pointer",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {confirmingOrderId === order.orderId ? (
                                          <>
                                            <Loader2
                                              className="animate-spin"
                                              size={13}
                                            />{" "}
                                            Xử lý...
                                          </>
                                        ) : (
                                          <>
                                            <i className="bi bi-check-circle-fill"></i>{" "}
                                            Đã nhận đơn
                                          </>
                                        )}
                                      </button>
                                    )}
                                    {canCancelOrder(order) ? (
                                      <button
                                        className="btn-order-action btn-order-cancel"
                                        onClick={() => {
                                          setCancelModalOrderId(order.orderId);
                                          setCancelReason(
                                            "Thay đổi ý định mua sắm / Không còn nhu cầu",
                                          );
                                          setCustomCancelReason("");
                                        }}
                                        disabled={
                                          cancelingOrderId === order.orderId
                                        }
                                      >
                                        <i className="bi bi-x-circle"></i> Hủy
                                        đơn
                                      </button>
                                    ) : null}
                                    {canReturnOrder(order) && (
                                      <button
                                        className="btn-order-action btn-order-cancel"
                                        style={{ borderColor: "#f59e0b", color: "#b45309" }}
                                        onClick={() => {
                                          setReturnModalOrderId(order.orderId);
                                          setReturnReason("Hàng lỗi / Không hoạt động");
                                          setCustomReturnReason("");
                                          const pm = order.metadata?.payment_method;
                                          setRefundDestination((pm === "zalopay" || pm === "vnpay") ? "wallet" : "bank_transfer");
                                          setRefundBankName("");
                                          setRefundAccountNumber("");
                                          setRefundAccountName("");
                                        }}
                                        disabled={returningOrderId === order.orderId}
                                      >
                                        <i className="bi bi-arrow-return-left"></i> Yêu cầu trả hàng
                                      </button>
                                    )}
                                    {order.metadata?.return_requested && order.metadata?.custom_status !== "refunded" && (
                                      <span
                                        className="cancel-blocked-note"
                                        title="Đang chờ duyệt yêu cầu trả hàng"
                                        style={{ fontSize: "0.75rem", color: "#b45309", fontStyle: "italic" }}
                                      >
                                        <i className="bi bi-hourglass-split"></i> Đang duyệt trả hàng
                                      </span>
                                    )}
                                    {!canCancelOrder(order) &&
                                      !canReturnOrder(order) &&
                                      !order.metadata?.return_requested &&
                                      !canConfirmReceipt(order) &&
                                      getCancelBlockedReason(order) && (
                                      <span
                                        className="cancel-blocked-note"
                                        title={
                                          getCancelBlockedReason(order) ||
                                          undefined
                                        }
                                        style={{
                                          fontSize: "0.75rem",
                                          color: "var(--text-muted, #888)",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        <i className="bi bi-info-circle"></i>{" "}
                                        {getCancelBlockedReason(order)}
                                      </span>
                                    )}
                                    <button
                                      className="btn-order-action btn-order-detail"
                                      onClick={() =>
                                        setSelectedOrderId(order.orderId)
                                      }
                                    >
                                      <i className="bi bi-eye"></i> Chi tiết
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {/* Demo mock orders */}
                            {MOCK_ORDERS.map((order) => (
                              <tr key={order.id}>
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--ink)",
                                  }}
                                >
                                  {order.id}
                                </td>
                                <td>{order.date.split(" – ")[0]}</td>
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--indigo)",
                                  }}
                                >
                                  {formatPrice(order.total)}
                                </td>
                                <td>
                                  {order.paymentStatus === "Đã thanh toán" ? (
                                    <span className="status-badge badge-completed">
                                      <i className="bi bi-check-circle-fill"></i>{" "}
                                      Đã thanh toán
                                    </span>
                                  ) : (
                                    <span className="status-badge badge-pending">
                                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
                                      Chưa thanh toán
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={getShippingBadgeClass(
                                      order.shippingStatus,
                                    )}
                                  >
                                    <i
                                      className={getShippingBadgeIcon(
                                        order.shippingStatus,
                                      )}
                                    ></i>{" "}
                                    {order.shippingStatus}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    display: "flex",
                                    gap: "0.5rem",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    className="btn-order-action btn-order-detail"
                                    onClick={() => setSelectedOrderId(order.id)}
                                  >
                                    <i className="bi bi-eye"></i> Chi tiết
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // Order Details View
                    selectedOrder && (
                      <div className="order-details-card">
                        <button
                          className="btn-back"
                          onClick={() => setSelectedOrderId(null)}
                        >
                          <i className="bi bi-arrow-left"></i> Trở lại danh sách
                          đơn hàng
                        </button>

                        <div className="order-details-header">
                          <div>
                            <h2
                              style={{
                                fontFamily: "var(--ff-display)",
                                fontSize: "1.5rem",
                                fontWeight: 800,
                              }}
                            >
                              Chi tiết đơn hàng #
                              {selectedOrder.display_id ||
                                formatOrderId(selectedOrder.id)}
                            </h2>
                            <p
                              className="text-xs text-muted"
                              style={{ marginTop: "0.2rem" }}
                            >
                              Đặt lúc {selectedOrder.date}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginTop: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 500,
                                }}
                              >
                                Mã đơn hàng:
                              </span>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  background: "var(--bg)",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--rule)",
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  color: "var(--ink)",
                                }}
                              >
                                <span>{selectedOrder.id}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedOrder.id,
                                    );
                                    setCopiedOrderId(selectedOrder.id);
                                    setTimeout(
                                      () => setCopiedOrderId(null),
                                      2000,
                                    );
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    padding: "0 2px",
                                    cursor: "pointer",
                                    color:
                                      copiedOrderId === selectedOrder.id
                                        ? "#10b981"
                                        : "var(--text-muted)",
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "color 0.2s ease",
                                  }}
                                  title="Sao chép mã đơn hàng"
                                >
                                  <i
                                    className={
                                      copiedOrderId === selectedOrder.id
                                        ? "bi bi-clipboard-check-fill"
                                        : "bi bi-clipboard"
                                    }
                                  ></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <span
                            className={getShippingBadgeClass(
                              selectedOrder.shippingStatus,
                            )}
                            style={{
                              padding: "0.4rem 1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <i
                              className={getShippingBadgeIcon(
                                selectedOrder.shippingStatus,
                              )}
                            ></i>{" "}
                            {selectedOrder.shippingStatus}
                          </span>
                        </div>

                        {/* STEPPER PROGRESS */}
                        {selectedOrder.statusStep >= 0 && (
                          <div
                            style={{
                              background: "var(--bg)",
                              borderRadius: "var(--r)",
                              padding: "1.5rem 1rem",
                              marginBottom: "1.5rem",
                              border: "1px solid var(--rule)",
                            }}
                          >
                            <div className="tracking-steps">
                              <div
                                className={`tracking-step ${selectedOrder.statusStep >= 0 ? "done" : ""} ${selectedOrder.statusStep === 0 ? "current" : ""}`}
                              >
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 0 ? (
                                    <i className="bi bi-check2"></i>
                                  ) : (
                                    <i className="bi bi-receipt"></i>
                                  )}
                                </div>
                                <div className="step-label">Đã đặt</div>
                              </div>
                              <div
                                className={`tracking-step ${selectedOrder.statusStep >= 1 ? "done" : ""} ${selectedOrder.statusStep === 1 ? "current" : ""}`}
                              >
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 1 ? (
                                    <i className="bi bi-check2"></i>
                                  ) : (
                                    <i className="bi bi-patch-check"></i>
                                  )}
                                </div>
                                <div className="step-label">Xác nhận</div>
                              </div>
                              <div
                                className={`tracking-step ${selectedOrder.statusStep >= 2 ? "done" : ""} ${selectedOrder.statusStep === 2 ? "current" : ""}`}
                              >
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 2 ? (
                                    <i className="bi bi-check2"></i>
                                  ) : (
                                    <i className="bi bi-box-seam"></i>
                                  )}
                                </div>
                                <div className="step-label">Đóng gói</div>
                              </div>
                              <div
                                className={`tracking-step ${selectedOrder.statusStep >= 3 ? "done" : ""} ${selectedOrder.statusStep === 3 ? "current" : ""}`}
                              >
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 3 ? (
                                    <i className="bi bi-check2"></i>
                                  ) : (
                                    <i className="bi bi-truck"></i>
                                  )}
                                </div>
                                <div className="step-label">Đang giao</div>
                              </div>
                              <div
                                className={`tracking-step ${selectedOrder.statusStep >= 4 ? "done" : ""} ${selectedOrder.statusStep === 4 ? "current" : ""}`}
                              >
                                <div className="step-icon">
                                  <i className="bi bi-house-check"></i>
                                </div>
                                <div className="step-label">Đã nhận</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SHIPPING & PAYMENT INFO */}
                        <div className="order-details-grid">
                          <div className="info-card">
                            <div className="info-card-title">
                              Địa chỉ nhận hàng
                            </div>
                            <div className="info-card-text">
                              <strong
                                style={{
                                  display: "block",
                                  marginBottom: "0.3rem",
                                  color: "var(--ink)",
                                }}
                              >
                                {selectedOrder.shippingAddress.name}
                              </strong>
                              <span
                                style={{
                                  display: "block",
                                  marginBottom: "0.2rem",
                                }}
                              >
                                <i
                                  className="bi bi-telephone text-muted"
                                  style={{ marginRight: "0.4rem" }}
                                ></i>
                                {selectedOrder.shippingAddress.phone}
                              </span>
                              <span>
                                <i
                                  className="bi bi-geo-alt text-muted"
                                  style={{ marginRight: "0.4rem" }}
                                ></i>
                                {selectedOrder.shippingAddress.address}
                              </span>
                            </div>
                          </div>

                          <div className="info-card">
                            <div className="info-card-title">
                              Phương thức thanh toán
                            </div>
                            <div className="info-card-text">
                              <span
                                style={{
                                  fontWeight: 600,
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  color: "var(--ink)",
                                }}
                              >
                                {selectedOrder.paymentMethod}
                              </span>
                              <div
                                className="flex-center text-xs"
                                style={{ justifyContent: "flex-start" }}
                              >
                                <span
                                  className={`status-badge ${selectedOrder.paymentStatus === "Đã thanh toán" ? "badge-completed" : "badge-pending"}`}
                                >
                                  <i
                                    className={
                                      selectedOrder.paymentStatus ===
                                      "Đã thanh toán"
                                        ? "bi bi-check-circle-fill"
                                        : "bi bi-exclamation-circle-fill"
                                    }
                                  ></i>
                                  {selectedOrder.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedOrder.trackingNumber &&
                            (() => {
                              const providerInfo = getShippingProviderInfo(
                                selectedRealOrder || selectedOrder,
                                selectedOrder.trackingNumber,
                              );
                              return (
                                <div className="info-card">
                                  <div className="info-card-title">
                                    {providerInfo.label}
                                  </div>
                                  <div className="info-card-text">
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "var(--ink)",
                                      }}
                                    >
                                      {selectedOrder.trackingNumber}
                                    </span>
                                    <div
                                      className="flex-center text-xs"
                                      style={{ justifyContent: "flex-start" }}
                                    >
                                      <a
                                        href={providerInfo.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-order-action btn-order-detail"
                                        style={{
                                          textDecoration: "none",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.3rem",
                                          padding: "0.3rem 0.7rem",
                                        }}
                                      >
                                        <i className="bi bi-box-seam"></i>{" "}
                                        {providerInfo.buttonText}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                        </div>

                        {/* ORDER ITEMS */}
                        <div
                          style={{
                            fontFamily: "var(--ff-display)",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            marginBottom: "0.8rem",
                          }}
                        >
                          Sản phẩm trong đơn hàng
                        </div>
                        <div className="order-items-list">
                          {selectedOrder.items.map((item: any, idx: number) => (
                            <div className="order-item-row" key={idx}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="order-item-img"
                              />
                              <div className="order-item-info">
                                <div className="order-item-name">
                                  {item.name}
                                </div>
                                <div className="order-item-meta">
                                  Phân loại: {item.variant} &middot; Số lượng:{" "}
                                  {item.quantity}
                                </div>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SUMS */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            flexWrap: "wrap",
                            gap: "1.5rem",
                            marginTop: "1.5rem",
                          }}
                        >
                          {/* TIMELINE MINI */}
                          <div style={{ flex: 1, minWidth: "280px" }}>
                            <div
                              style={{
                                fontFamily: "var(--ff-display)",
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                marginBottom: "0.8rem",
                              }}
                            >
                              Lịch sử vận chuyển
                            </div>
                            <div
                              className="timeline"
                              style={{
                                background: "white",
                                padding: "1rem",
                                border: "1px solid var(--rule)",
                                borderRadius: "var(--r)",
                              }}
                            >
                              {(selectedOrder.timeline as any[]).map(
                                (event: any, idx) => (
                                  <div className="timeline-item" key={idx}>
                                    <div
                                      className={`timeline-dot ${event.current ? "current" : ""} ${event.done ? "done" : ""}`}
                                    >
                                      {event.current ? (
                                        <i className="bi bi-truck"></i>
                                      ) : (
                                        <i className="bi bi-check"></i>
                                      )}
                                    </div>
                                    <div className="timeline-time">
                                      {event.time}
                                    </div>
                                    <div className="timeline-desc">
                                      {event.desc}
                                    </div>
                                    {event.sub && (
                                      <div className="timeline-sub">
                                        {event.sub}
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* TOTALS */}
                          <div
                            className="order-totals-card"
                            style={{ minWidth: "280px" }}
                          >
                            <div className="total-row">
                              <span className="text-muted">Tạm tính:</span>
                              <span style={{ fontWeight: 600 }}>
                                {formatPrice(
                                  selectedOrder.total -
                                    selectedOrder.shippingFee,
                                )}
                              </span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">
                                Phí vận chuyển:
                              </span>
                              <span style={{ fontWeight: 600 }}>
                                {formatPrice(selectedOrder.shippingFee)}
                              </span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">Giảm giá:</span>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "var(--emerald)",
                                }}
                              >
                                {formatPrice(0)}
                              </span>
                            </div>
                            <div className="total-row grand-total">
                              <span>Tổng cộng:</span>
                              <span>{formatPrice(selectedOrder.total)}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: "1.5rem",
                            paddingTop: "1.2rem",
                            borderTop: "1px solid var(--rule)",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "1rem",
                            alignItems: "center",
                            flexWrap: "wrap",
                            width: "100%",
                          }}
                        >
                          {selectedRealOrder &&
                            canConfirmReceipt(selectedRealOrder) && (
                              <button
                                className="btn btn--success"
                                onClick={() =>
                                  handleConfirmReceipt(selectedOrder.id)
                                }
                                disabled={
                                  confirmingOrderId === selectedOrder.id
                                }
                                style={{
                                  background:
                                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "0.65rem 1.4rem",
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  boxShadow:
                                    "0 4px 12px rgba(16, 185, 129, 0.25)",
                                  cursor: "pointer",
                                }}
                              >
                                {confirmingOrderId === selectedOrder.id ? (
                                  <>
                                    <Loader2
                                      className="animate-spin"
                                      size={16}
                                    />{" "}
                                    Đang xử lý...
                                  </>
                                ) : (
                                  <>
                                    <i
                                      className="bi bi-box-seam-fill"
                                      style={{ fontSize: "1.1rem" }}
                                    ></i>{" "}
                                    Xác nhận đã nhận được hàng
                                  </>
                                )}
                              </button>
                            )}
                          {selectedRealOrder &&
                            canCancelOrder(selectedRealOrder) && (
                              <button
                                className="btn-order-action btn-order-cancel"
                                style={{
                                  padding: "0.6rem 1.5rem",
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                }}
                                onClick={() => {
                                  setCancelModalOrderId(selectedOrderId!);
                                  setCancelReason(
                                    "Thay đổi ý định mua sắm / Không còn nhu cầu",
                                  );
                                  setCustomCancelReason("");
                                }}
                                disabled={
                                  cancelingOrderId === selectedOrderId
                                }
                              >
                                <i
                                  className="bi bi-x-circle"
                                  style={{ fontSize: "1rem" }}
                                ></i>{" "}
                                Hủy đơn hàng này
                              </button>
                            )}
                          {selectedRealOrder &&
                            canReturnOrder(selectedRealOrder) && (
                              <button
                                className="btn-order-action btn-order-cancel"
                                style={{
                                  padding: "0.6rem 1.5rem",
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                  borderColor: "#f59e0b",
                                  color: "#b45309",
                                }}
                                onClick={() => {
                                  setReturnModalOrderId(selectedOrderId!);
                                  const pm2 = realOrders.find(
                                    (o) => o.orderId === selectedOrderId,
                                  )?.metadata?.payment_method;
                                  setRefundDestination(
                                    pm2 === "zalopay" || pm2 === "vnpay"
                                      ? "wallet"
                                      : "bank_transfer",
                                  );
                                  setRefundBankName("");
                                  setRefundAccountNumber("");
                                  setRefundAccountName("");
                                  setReturnReason("Hàng lỗi / Không hoạt động");
                                  setCustomReturnReason("");
                                }}
                                disabled={
                                  returningOrderId === selectedOrderId
                                }
                              >
                                <i
                                  className="bi bi-arrow-return-left"
                                  style={{ fontSize: "1rem" }}
                                ></i>{" "}
                                Yêu cầu trả hàng
                              </button>
                            )}
                          {selectedRealOrder &&
                            selectedRealOrder.metadata?.return_requested && (
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#b45309",
                                  fontStyle: "italic",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                }}
                              >
                                <i className="bi bi-hourglass-split"></i> Đang
                                chờ duyệt yêu cầu trả hàng
                              </span>
                            )}
                          {selectedRealOrder &&
                            !canCancelOrder(selectedRealOrder) &&
                            !canReturnOrder(selectedRealOrder) &&
                            !selectedRealOrder.metadata?.return_requested &&
                            getCancelBlockedReason(selectedRealOrder) && (
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--text-muted, #888)",
                                  fontStyle: "italic",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                }}
                              >
                                <i className="bi bi-info-circle"></i>{" "}
                                {getCancelBlockedReason(selectedRealOrder)}
                              </span>
                            )}
                        </div>
                      </div>
                    )
                  )}
              </div>
              <div className="address-modal-footer">
                <button className="btn btn--ghost" onClick={() => setReturnModalOrderId(null)}>Quay lại</button>
                <button 
                  className="btn" 
                  style={{ background: "#d97706", color: "white", border: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => {
                    const finalReason = returnReason === "Lý do khác" ? customReturnReason : returnReason;
                    if (!finalReason || !finalReason.trim()) {
                      alert("Vui lòng chọn hoặc nhập lý do trả hàng.");
                      return;
                    }
                    
                    let compiledRefundInfo = "";
                    if (refundDestination === "bank_transfer") {
                      if (!refundBankName.trim() || !refundAccountNumber.trim() || !refundAccountName.trim()) {
                        alert("Vui lòng điền đầy đủ thông tin ngân hàng.");
                        return;
                      }
                      compiledRefundInfo = `Ngân hàng: ${refundBankName.trim()} - STK: ${refundAccountNumber.trim()} - Chủ thẻ: ${refundAccountName.trim()}`;
                    }
                    handleReturnOrder(returnModalOrderId, finalReason, compiledRefundInfo, refundDestination);
                  }}
                  disabled={returningOrderId === returnModalOrderId}
                >
                  {returningOrderId === returnModalOrderId ? 'Đang gửi...' : 'Gửi yêu cầu trả hàng'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      {/* TOPUP MODAL */}
        {showTopupModal && (
          <div className="address-modal-overlay" onClick={() => setShowTopupModal(false)}>
            <motion.div 
              className="address-modal-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="address-modal-header">
                <h3>Nạp tiền vào Ví Sprylo</h3>
                <button className="close-btn" onClick={() => setShowTopupModal(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Số tiền cần nạp (VNĐ)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={topupAmount} 
                    onChange={e => setTopupAmount(e.target.value)} 
                    placeholder="VD: 100000"
                    min="10000"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                    Thanh toán qua cổng VNPAY.
                  </p>
                </div>
              </div>
              <div className="address-modal-footer">
                <button className="btn btn--ghost" onClick={() => setShowTopupModal(false)}>Hủy</button>
                <button 
                  className="btn btn--primary" 
                  onClick={handleTopupSubmit}
                  disabled={topupLoading}
                >
                  {topupLoading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountPage;
