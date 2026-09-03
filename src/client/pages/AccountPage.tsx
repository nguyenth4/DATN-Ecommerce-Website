import { useState, useEffect, useMemo, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import toast from "react-hot-toast";
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

const formatTiktokOrderId = (displayId?: string | number | null, orderId?: string) => {
  if (displayId != null) {
    // Generate an 18-digit ID like Tiktok Shop: prefix 57760810 + pad 10 digits
    return `57760810${displayId.toString().padStart(10, '0')}`;
  }
  return formatOrderId(orderId || '');
};

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParamsQ, setSearchParams] = useSearchParams();

  // Đọc ?tab= từ URL hoặc localStorage để tự động giữ nguyên tab khi F5 / load lại trang
  const initialTab = (() => {
    const t = searchParamsQ.get("tab") || localStorage.getItem("sprylo_active_account_tab");
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

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  useEffect(() => {
    localStorage.setItem("sprylo_active_account_tab", activeTab);
    const currentTabInUrl = searchParamsQ.get("tab");
    if (currentTabInUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParamsQ, setSearchParams]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [realOrders, setRealOrders] = useState(getRealOrders);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [retryingPaymentId, setRetryingPaymentId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null,
  );
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [cancelRefundDestination, setCancelRefundDestination] = useState<"wallet" | "bank_transfer" | "">("");
  const [cancelRefundInfo, setCancelRefundInfo] = useState<string>("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // ─── Review States ──────────────────────────────────────────────────────────
  interface SavedReviewData {
    reviewId?: string;
    rating: number;
    comment: string;
    updatedAt?: string;
  }

  // reviewState: map key -> { rating, comment, loading, done, isEditing, reviewId, error }
  const [reviewState, setReviewState] = useState<Record<string, {
    rating: number;
    comment: string;
    loading: boolean;
    done: boolean;
    isEditing?: boolean;
    reviewId?: string;
    error: string;
  }>>({});

  const getSavedCustomerReviews = (): Record<string, SavedReviewData> => {
    try {
      return JSON.parse(localStorage.getItem("sprylo_customer_reviews") || "{}");
    } catch {
      return {};
    }
  };

  const saveCustomerReviewData = (key: string, data: SavedReviewData) => {
    const reviews = getSavedCustomerReviews();
    reviews[key] = data;
    localStorage.setItem("sprylo_customer_reviews", JSON.stringify(reviews));
  };

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
    _productName: string,
    orderId?: string
  ) => {
    const key = orderId ? `${orderId}_${productId}` : productId;
    const state = reviewState[key] || reviewState[productId] || { rating: 5, comment: "", loading: false, done: false, isEditing: false, reviewId: "", error: "" };

    const commentTrimmed = state.comment.trim();
    if (!commentTrimmed) {
      const err = "Vui lòng nhập nội dung đánh giá của bạn.";
      setReviewState(prev => ({ ...prev, [key]: { ...state, error: err }, [productId]: { ...state, error: err } }));
      toast.error(err);
      return;
    }

    if (commentTrimmed.replace(/\s+/g, "").length < 10) {
      const err = "Đánh giá quá ngắn, vui lòng nhập ít nhất 10 ký tự.";
      setReviewState(prev => ({ ...prev, [key]: { ...state, error: err }, [productId]: { ...state, error: err } }));
      toast.error(err);
      return;
    }

    setReviewState(prev => ({ ...prev, [key]: { ...state, loading: true, error: "" }, [productId]: { ...state, loading: true, error: "" } }));

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
      const isUpdating = Boolean(state.reviewId);
      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
        method: isUpdating ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          review_id: isUpdating ? state.reviewId : undefined,
          product_id: productId,
          order_id: orderId || selectedOrderId || undefined,
          rating: state.rating,
          comment: commentTrimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const reviewId = data.review?.id || state.reviewId || "";
        const savedData: SavedReviewData = {
          reviewId,
          rating: state.rating,
          comment: commentTrimmed,
          updatedAt: new Date().toISOString(),
        };

        saveCustomerReviewData(key, savedData);
        saveCustomerReviewData(productId, savedData);
        markProductReviewed(productId);

        const updatedState = {
          rating: state.rating,
          comment: commentTrimmed,
          loading: false,
          done: true,
          isEditing: false,
          reviewId,
          error: "",
        };

        setReviewState(prev => ({
          ...prev,
          [key]: updatedState,
          [productId]: updatedState,
        }));

        toast.success(isUpdating ? "Đã cập nhật đánh giá thành công!" : "Cảm ơn bạn đã gửi đánh giá!");
        window.dispatchEvent(new Event('review-updated'));
      } else {
        const errMessage = data.message || "Gửi đánh giá thất bại.";
        setReviewState(prev => ({
          ...prev,
          [key]: { ...state, loading: false, error: errMessage },
          [productId]: { ...state, loading: false, error: errMessage },
        }));
        toast.error(errMessage);
      }
    } catch {
      const errMessage = "Lỗi kết nối máy chủ.";
      setReviewState(prev => ({
        ...prev,
        [key]: { ...state, loading: false, error: errMessage },
        [productId]: { ...state, loading: false, error: errMessage },
      }));
      toast.error(errMessage);
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
        if (order.paymentMethod !== "cod" && (order.payment_status === "awaiting" || order.payment_status === "requires_action")) {
          return "bi bi-credit-card";
        }
        return "bi bi-clock-history";
    }
  };

  const getOrderFulfillmentBadgeText = (order: any) => {
    if (order.canceled || order.status === "canceled") return "Đã hủy";

    const customStatus = order.metadata?.custom_status;
    
    // Ưu tiên hiển thị trạng thái Trả hàng / Hoàn tiền
    if (customStatus === "refunded") return "Đã trả hàng/Hoàn tiền";
    if (order.metadata?.return_requested && customStatus !== "refunded") return "Đang duyệt trả hàng";

    if (customStatus) {
      if (customStatus === "pending") return "Chờ xác nhận";
      if (customStatus === "confirmed") return "Đã xác nhận";
      if (customStatus === "preparing") return "Đóng gói hàng";
      if (customStatus === "shipping") return "Đang giao";
      if (customStatus === "delivered" || customStatus === "completed")
        return "Đã nhận";
      if (customStatus === "canceled") return "Đã hủy";
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
        if (order.paymentMethod !== "cod" && (order.payment_status === "awaiting" || order.payment_status === "requires_action")) {
          return "Chờ thanh toán";
        }
        return "Chờ xác nhận";
    }
  };

  const syncOrders = async () => {
    try {
      const token = localStorage.getItem("customer_token");
      if (!token) return;

      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders?limit=50&fields=*items,*shipping_address`,
      );
      if (response.ok) {
        const { orders } = await response.json();
        if (orders && Array.isArray(orders)) {
          // const localOrders = getRealOrders();

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
          }).sort((a: any, b: any) => b.created_at - a.created_at);

          setRealOrders(remoteMapped);
          // Optional: Only update sprylo_orders if we want to cache it, but safer to just rely on state
          localStorage.setItem("sprylo_orders", JSON.stringify(remoteMapped));
        }
      }
    } catch (err) {
      console.error("Failed to sync orders from backend:", err);
    }
  };

  // Profile form state

  const [refundDestination, setRefundDestination] = useState<"wallet" | "bank_transfer">("wallet");
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number | string>(100000);
  const [topupLoading, setTopupLoading] = useState(false);
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

  // Fetch profile on mount
  // Address states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

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

  // Fetch product data from Medusa for wishlist items (leveraging cached query)
  const { data: productsData, isLoading: isWishlistLoading } = useProducts({
    limit: 100,
  });

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

    switch (order.fulfillment_status) {
      case "shipped":
      case "partially_shipped":
        return 3;
      case "fulfilled":
      case "partially_fulfilled":
        return 2;
      default:
        return 0;
    }
  };

  // Cancel is only allowed when order is pending (step 0)
  const canCancelOrder = (order: any) => {
    if (order.canceled || order.status === "canceled") return false;
    const step = getDynamicStatusStep(order);
    return step === 0;
  };

  // Return is allowed when order is delivered and no return is currently requested
  // and it has been 7 days or less since delivery.
  const canReturnOrder = (order: any) => {
    if (order.canceled || order.status === 'canceled') return false;
    const step = getDynamicStatusStep(order);
    
    if (step !== 4 || order.metadata?.return_requested) return false;

    // Check if 7 days have passed since delivery
    const deliveredDateStr = order.metadata?.delivered_at || order.updated_at;
    if (deliveredDateStr) {
      const deliveredDate = new Date(deliveredDateStr);
      const now = new Date();
      const diffTime = now.getTime() - deliveredDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return false;
      }
    }

    return true;
  };

  const [returnModalOrderId, setReturnModalOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Hàng lỗi / Không hoạt động');
  const [customReturnReason, setCustomReturnReason] = useState<string>('');
  
  // Refund info state
  const [refundMethod, setRefundMethod] = useState<string>('bank_transfer');
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
    if (refundMethod === 'bank_transfer' && refundBankName && refundAccountNumber && refundAccountNumber.length >= 5) {
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
  }, [refundBankName, refundAccountNumber, refundMethod]);

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
      console.error(e);
      alert("Lỗi mạng khi gọi API nạp tiền.");
    } finally {
      setTopupLoading(false);
    }
  };

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
          selectedRealOrder.metadata?.payment_status === "paid" ||
          selectedRealOrder.metadata?.payment_status === "captured" ||
          selectedRealOrder.paymentMethod === "wallet"
            ? "Đã thanh toán"
            : "Chưa thanh toán",
        shippingStatus: getOrderFulfillmentBadgeText(selectedRealOrder),
        shippingAddress: {
          name: selectedRealOrder.shipping_address?.first_name 
            ? `${selectedRealOrder.shipping_address.last_name || ''} ${selectedRealOrder.shipping_address.first_name}`.trim() 
            : selectedRealOrder.customer?.fullName || "Khách Hàng",
          phone: selectedRealOrder.shipping_address?.phone || selectedRealOrder.customer?.phoneNumber || "Chưa cập nhật số ĐT",
          address: selectedRealOrder.shipping_address?.address_1 
            ? `${selectedRealOrder.shipping_address.address_1}${selectedRealOrder.shipping_address.city ? `, ${selectedRealOrder.shipping_address.city}` : ''}${selectedRealOrder.shipping_address.province ? `, ${selectedRealOrder.shipping_address.province}` : ''}` 
            : selectedRealOrder.address || "Chưa cập nhật địa chỉ",
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
  const handleRetryPayment = async (orderId: string) => {
    setRetryingPaymentId(orderId);
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/payment-link`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-publishable-api-key": (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_test"
        },
      });
      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Retry payment error:", error);
      alert("Đã xảy ra lỗi khi tạo liên kết thanh toán.");
    } finally {
      setRetryingPaymentId(null);
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string, refundDest?: string, refundInfo?: string) => {
    setCancelingOrderId(orderId);
    try {
      const order = realOrders.find((o) => o.orderId === orderId);
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            items: order?.items || [],
            cancelReason: reason,
            refundDestination: cancelRefundDestination,
            refundInfo: cancelRefundInfo
          }),
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
    refundInfo: string = "",
    refundDest: string = "wallet"
  ) => {
    setReturningOrderId(orderId);
    try {
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/request-return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason,
            refund_info: refundInfo,
            refund_method: refundMethod,
            refund_destination: refundDest,
          }),
        },
      );
      if (response.ok) {
        const updated = realOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                metadata: {
                  ...order.metadata,
                  return_requested: true,
                  return_reason: reason,
                  refund_info: refundInfo,
                  refund_method: refundMethod,
                },
              }
            : order,
        );
        localStorage.setItem("sprylo_orders", JSON.stringify(updated));
        setRealOrders(updated);
        setReturnModalOrderId(null);
        setRefundMethod("bank_transfer");
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
                  onClick={() => handleTabChange("profile")}
                >
                  <User size={18} style={{ marginRight: "12px" }} /> Thông tin
                  cá nhân
                </div>
                <div
                  className={`account-nav-item ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => handleTabChange("orders")}
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
                  onClick={() => handleTabChange("addresses")}
                >
                  <MapPin size={18} style={{ marginRight: "12px" }} /> Địa chỉ
                  giao hàng
                </div>
                <div
                  className={`account-nav-item ${activeTab === "wishlist" ? "active" : ""}`}
                  onClick={() => handleTabChange("wishlist")}
                >
                  <Heart size={18} style={{ marginRight: "12px" }} /> Sản phẩm
                  yêu thích
                </div>
                <div
                  className={`account-nav-item ${activeTab === "wallet" ? "active" : ""}`}
                  onClick={() => handleTabChange("wallet")}
                >
                  <Wallet size={18} style={{ marginRight: "12px" }} /> Ví điện
                  tử Sprylo
                </div>
                <div
                  className={`account-nav-item ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => handleTabChange("password")}
                >
                  <Lock size={18} style={{ marginRight: "12px" }} /> Đổi mật
                  khẩu
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
                                  order.metadata?.payment_status === "paid" ||
                                  order.metadata?.payment_status === "captured" ||
                                  order.paymentMethod === "wallet" ? (
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
                                    {order.payment_status !== "captured" && order.payment_status !== "paid" && (order.paymentMethod === "zalopay" || order.paymentMethod === "vnpay") && order.status !== "canceled" && (
                                      <button
                                        className="btn-order-action btn-order-cancel"
                                        style={{ borderColor: "#2563eb", color: "#2563eb" }}
                                        onClick={() => handleRetryPayment(order.orderId)}
                                        disabled={retryingPaymentId === order.orderId}
                                      >
                                        {retryingPaymentId === order.orderId ? (
                                          <><Loader2 className="animate-spin" size={13} /> Xử lý...</>
                                        ) : (
                                          <><i className="bi bi-wallet2"></i> Thanh toán lại</>
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
                                <span>{formatTiktokOrderId(selectedOrder.display_id, selectedOrder.id)}</span>
                                <button
                                  onClick={() => {
                                    const formattedId = formatTiktokOrderId(selectedOrder.display_id, selectedOrder.id).replace('#', '');
                                    navigator.clipboard.writeText(formattedId);
                                    setCopiedOrderId(formattedId);
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
                                      copiedOrderId === formatTiktokOrderId(selectedOrder.display_id, selectedOrder.id).replace('#', '')
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
                                      copiedOrderId === formatTiktokOrderId(selectedOrder.display_id, selectedOrder.id).replace('#', '')
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
                            {selectedRealOrder && selectedRealOrder.payment_status !== "captured" && selectedRealOrder.payment_status !== "paid" && (selectedRealOrder.paymentMethod === "zalopay" || selectedRealOrder.paymentMethod === "vnpay") && selectedRealOrder.status !== "canceled" && (
                              <button
                                className="btn-order-action btn-order-cancel"
                                style={{
                                  padding: "0.6rem 1.5rem",
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                  borderColor: "#2563eb",
                                  color: "#2563eb",
                                  marginRight: "10px"
                                }}
                                onClick={() => handleRetryPayment(selectedRealOrder.orderId)}
                                disabled={retryingPaymentId === selectedRealOrder.orderId}
                              >
                                {retryingPaymentId === selectedRealOrder.orderId ? (
                                  <><Loader2 className="animate-spin" size={13} /> Xử lý...</>
                                ) : (
                                  <><i className="bi bi-wallet2"></i> Thanh toán lại</>
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
                                    setReturnReason("Hàng lỗi / Không hoạt động");
                                    setCustomReturnReason("");
                                  }}
                                  disabled={returningOrderId === selectedOrderId}
                                >
                                  <i className="bi bi-arrow-return-left"></i>{" "}
                                  Yêu cầu trả hàng
                                </button>
                              )}

                            {selectedRealOrder &&
                              selectedRealOrder.metadata?.return_requested &&
                              selectedRealOrder.metadata?.custom_status !==
                                "refunded" && (
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
                                  <i className="bi bi-hourglass-split"></i>{" "}
                                  Đang chờ duyệt yêu cầu trả hàng
                                </span>
                              )}

                            {selectedRealOrder &&
                              !canCancelOrder(selectedRealOrder) &&
                              !canReturnOrder(selectedRealOrder) &&
                              !selectedRealOrder.metadata?.return_requested &&
                              !canConfirmReceipt(selectedRealOrder) &&
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

                            {selectedRealOrder &&
                              (selectedRealOrder.status === "completed" ||
                               selectedRealOrder.metadata?.custom_status === "completed" ||
                               selectedRealOrder.metadata?.custom_status === "delivered" ||
                               getDynamicStatusStep(selectedRealOrder) === 4) && (
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#10b981",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                  }}
                                >
                                  <i className="bi bi-check-circle-fill"></i>{" "}
                                  Đơn hàng đã hoàn thành
                                </span>
                              )}

                            {/* ─── REVIEW BLOCK (hiện khi đơn hàng hoàn thành / đã nhận) ─── */}
                            {selectedRealOrder &&
                              (selectedRealOrder.status === "completed" ||
                               selectedRealOrder.metadata?.custom_status === "completed" ||
                               selectedRealOrder.metadata?.custom_status === "delivered" ||
                               getDynamicStatusStep(selectedRealOrder) === 4) &&
                              (() => {
                                const rawItems = selectedOrder?.items?.length ? selectedOrder.items : (selectedRealOrder.items || []);
                                const reviewedList = getReviewedProducts();
                                const items = rawItems.map((it: any) => ({
                                  ...it,
                                  product_id: it.product_id || it.productId || it.variant?.product_id || it.id || (it.title ? `prod_${it.title}` : `prod_${it.name}`),
                                }));

                                if (items.length === 0) return null;
                                return (
                                  <div style={{
                                    marginTop: "1.5rem",
                                    width: "100%",
                                    background: "linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)",
                                    border: "1.5px solid #c4b5fd",
                                    borderRadius: "14px",
                                    padding: "1.25rem 1.5rem",
                                    textAlign: "left",
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                                      <span style={{ fontSize: "1.3rem" }}>⭐</span>
                                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#5b21b6" }}>
                                        Đánh giá sản phẩm trong đơn hàng
                                      </span>
                                    </div>
                                    {items.map((it: any, index: number) => {
                                      const pid = it.product_id || `prod_${index}`;
                                      const currentOrderId = selectedOrder?.id || selectedRealOrder?.id || selectedOrderId;
                                      const key = currentOrderId ? `${currentOrderId}_${pid}` : pid;
                                      const savedKeyData = getSavedCustomerReviews()[key];
                                      const savedPidData = getSavedCustomerReviews()[pid];
                                      const saved = savedKeyData || (currentOrderId ? undefined : savedPidData);

                                      const rs = reviewState[key] || {
                                        rating: saved?.rating || 5,
                                        comment: saved?.comment || "",
                                        loading: false,
                                        done: Boolean(saved || reviewState[key]?.done),
                                        isEditing: false,
                                        reviewId: saved?.reviewId || "",
                                        error: ""
                                      };

                                      const isEditing = rs.isEditing;

                                      return (
                                        <div key={pid || index} style={{
                                          background: "white",
                                          borderRadius: "12px",
                                          border: "1px solid #e9d5ff",
                                          padding: "1rem 1.25rem",
                                          marginBottom: "0.85rem",
                                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                                        }}>
                                          {/* Product info */}
                                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.85rem" }}>
                                            <img
                                              src={it.thumbnail || it.image || it.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80"}
                                              alt={it.title || it.name}
                                              style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid #f3f4f6" }}
                                            />
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1e1b4b" }}>{it.title || it.name}</div>
                                              {it.variant?.title && <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>Phân loại: {it.variant.title}</div>}
                                            </div>
                                          </div>

                                          {rs.done && !isEditing ? (
                                            /* SAVED REVIEW DISPLAY VIEW */
                                            <div style={{
                                              background: "#f8fafc",
                                              borderRadius: "10px",
                                              border: "1px solid #e2e8f0",
                                              padding: "0.85rem 1rem"
                                            }}>
                                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <i className="bi bi-check-circle-fill" /> Đã gửi đánh giá
                                                  </span>
                                                  <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.95rem" }}>
                                                    {"★".repeat(rs.rating)}{"☆".repeat(5 - rs.rating)} ({rs.rating}/5)
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const currentData = {
                                                      rating: rs.rating || saved?.rating || 5,
                                                      comment: rs.comment || saved?.comment || "",
                                                      loading: false,
                                                      done: true,
                                                      isEditing: true,
                                                      reviewId: rs.reviewId || saved?.reviewId || "",
                                                      error: ""
                                                    };
                                                    setReviewState(prev => ({
                                                      ...prev,
                                                      [key]: currentData,
                                                      [pid]: currentData
                                                    }));
                                                  }}
                                                  style={{
                                                    background: "#ffffff",
                                                    border: "1px solid #cbd5e1",
                                                    borderRadius: "6px",
                                                    padding: "4px 10px",
                                                    fontSize: "0.78rem",
                                                    fontWeight: 600,
                                                    color: "#475569",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                  }}
                                                >
                                                  <i className="bi bi-pencil-square" /> Chỉnh sửa
                                                </button>
                                              </div>

                                              <div style={{ fontSize: "0.88rem", color: "#334155", fontStyle: "italic", lineHeight: "1.5" }}>
                                                "{rs.comment || "Đánh giá xuất sắc!"}"
                                              </div>
                                            </div>
                                          ) : (
                                            /* FORM INPUT / EDIT MODE */
                                            <>
                                              {/* Star Rating */}
                                              <div style={{ display: "flex", gap: "4px", marginBottom: "0.6rem" }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                  <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewState(prev => ({
                                                      ...prev,
                                                      [key]: { ...rs, rating: star },
                                                      [pid]: { ...rs, rating: star }
                                                    }))}
                                                    style={{
                                                      background: "none", border: "none", cursor: "pointer",
                                                      fontSize: "1.5rem", padding: "0 2px",
                                                      color: star <= rs.rating ? "#f59e0b" : "#d1d5db",
                                                      transition: "color 0.15s",
                                                    }}
                                                  >★</button>
                                                ))}
                                                <span style={{ fontSize: "0.82rem", color: "#6b7280", alignSelf: "center", marginLeft: "6px", fontWeight: 600 }}>
                                                  {["Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rs.rating - 1]}
                                                </span>
                                              </div>

                                              {/* Comment textarea */}
                                              <textarea
                                                rows={3}
                                                placeholder="Chia sẻ cảm nhận chi tiết của bạn về sản phẩm..."
                                                value={rs.comment}
                                                onChange={e => setReviewState(prev => ({
                                                  ...prev,
                                                  [key]: { ...rs, comment: e.target.value, error: "" },
                                                  [pid]: { ...rs, comment: e.target.value, error: "" }
                                                }))}
                                                style={{
                                                  width: "100%", borderRadius: "8px",
                                                  border: rs.error ? "1.5px solid #ef4444" : "1px solid #d1d5db",
                                                  padding: "0.65rem 0.85rem",
                                                  fontSize: "0.88rem", resize: "vertical",
                                                  outline: "none", fontFamily: "inherit",
                                                  boxSizing: "border-box",
                                                }}
                                              />

                                              {rs.error && (
                                                <div style={{ color: "#dc2626", fontSize: "0.82rem", marginTop: "0.4rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                                  <i className="bi bi-exclamation-circle-fill" /> {rs.error}
                                                </div>
                                              )}

                                              <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem", justifyContent: "flex-end" }}>
                                                {isEditing && (
                                                  <button
                                                    type="button"
                                                    onClick={() => setReviewState(prev => ({
                                                      ...prev,
                                                      [key]: { ...rs, isEditing: false, error: "" },
                                                      [pid]: { ...rs, isEditing: false, error: "" }
                                                    }))}
                                                    style={{
                                                      background: "#f1f5f9",
                                                      border: "1px solid #cbd5e1",
                                                      borderRadius: "8px",
                                                      padding: "0.5rem 1rem",
                                                      fontSize: "0.82rem",
                                                      fontWeight: 600,
                                                      color: "#64748b",
                                                      cursor: "pointer"
                                                    }}
                                                  >
                                                    Hủy
                                                  </button>
                                                )}

                                                <button
                                                  type="button"
                                                  onClick={() => handleSubmitReview(pid, it.title || it.name || "Sản phẩm", currentOrderId)}
                                                  disabled={rs.loading}
                                                  style={{
                                                    background: rs.loading ? "#a78bfa" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                                                    color: "white", border: "none",
                                                    borderRadius: "8px", padding: "0.5rem 1.25rem",
                                                    fontSize: "0.85rem", fontWeight: 700,
                                                    cursor: rs.loading ? "wait" : "pointer",
                                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                                    boxShadow: "0 2px 4px rgba(124, 58, 237, 0.25)"
                                                  }}
                                                >
                                                  {rs.loading ? (
                                                    <><i className="bi bi-hourglass-split" /> Đang xử lý...</>
                                                  ) : isEditing ? (
                                                    <><i className="bi bi-check2-circle" /> Lưu cập nhật</>
                                                  ) : (
                                                    <><i className="bi bi-send" /> Gửi đánh giá</>
                                                  )}
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
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
                      Địa chỉ giao hàng
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.2rem",
                      }}
                    >
                      {addresses.length === 0 ? (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "3rem 1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              background: "var(--indigo-soft, #e0e7ff)",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--indigo)",
                              marginBottom: "1rem",
                            }}
                          >
                            <MapPin size={28} />
                          </div>
                          <p
                            style={{
                              margin: "0 0 1rem 0",
                              color: "var(--fg-soft)",
                              fontSize: "0.95rem",
                            }}
                          >
                            Bạn chưa lưu địa chỉ giao hàng nào.
                          </p>
                          <button
                            className="btn btn-sm btn--indigo"
                            onClick={handleAddClick}
                            style={{
                              padding: "0.5rem 1.25rem",
                              borderRadius: "20px",
                            }}
                          >
                            Thêm địa chỉ đầu tiên
                          </button>
                        </div>
                      ) : (
                        addresses.map((addr: any) => (
                          <div
                            key={addr.id}
                            className={`address-card ${addr.is_default_shipping ? "default" : ""}`}
                            style={{ position: "relative" }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "1.2rem",
                                right: "1.2rem",
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                              }}
                            >
                              {addr.is_default_shipping && (
                                <span
                                  className="status-badge badge-completed"
                                  style={{
                                    fontSize: "0.65rem",
                                    padding: "0.15rem 0.5rem",
                                  }}
                                >
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <h4
                              style={{
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                marginBottom: "0.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {addr.company === "Văn phòng" ? (
                                <i className="bi bi-briefcase text-muted"></i>
                              ) : addr.company === "Nhà riêng" ? (
                                <i className="bi bi-house text-muted"></i>
                              ) : (
                                <i className="bi bi-geo-alt text-muted"></i>
                              )}
                              {addr.company || "Địa chỉ"}
                            </h4>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                lineHeight: 1.6,
                                color: "var(--fg-soft)",
                              }}
                            >
                              <strong>
                                {`${addr.first_name || ""} ${addr.last_name || ""}`.trim()}
                              </strong>
                              <br />
                              {addr.phone || "Chưa có SĐT"}
                              <br />
                              {[
                                addr.address_1,
                                addr.address_2,
                                addr.city !== "Toàn khu vực" ? addr.city : null,
                                addr.province,
                              ]
                                .filter((part) => part && part.trim() !== "")
                                .join(", ")}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "1rem",
                                borderTop: "1px solid var(--rule)",
                                paddingTop: "0.8rem",
                              }}
                            >
                              <div style={{ display: "flex", gap: "0.8rem" }}>
                                <button
                                  onClick={() => handleEditClick(addr)}
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--indigo)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  <i className="bi bi-pencil"></i> Chỉnh sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--rose)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  <i className="bi bi-trash"></i> Xóa
                                </button>
                              </div>
                              {!addr.is_default_shipping && (
                                <button
                                  onClick={() =>
                                    handleSetDefaultAddress(addr.id)
                                  }
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--fg-mute)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Đặt mặc định
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {addresses.length > 0 && (
                      <button
                        className="btn btn--indigo"
                        onClick={handleAddClick}
                        style={{
                          marginTop: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="bi bi-plus-lg"></i> Thêm địa chỉ mới
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
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
                      Sản phẩm yêu thích ({wishlistIds.length})
                    </div>

                    {isWishlistLoading ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "2rem 0",
                          color: "var(--fg-mute)",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-block",
                            width: "24px",
                            height: "24px",
                            border: "3px solid var(--indigo-line)",
                            borderTopColor: "var(--indigo)",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            marginBottom: "0.5rem",
                          }}
                        ></div>
                        <p style={{ margin: 0, fontSize: "0.85rem" }}>
                          Đang tải...
                        </p>
                      </div>
                    ) : wishlistProducts.length === 0 ? (
                      <div
                        style={{ textAlign: "center", padding: "3rem 1rem" }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "var(--rose-soft, #fff1f2)",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--rose)",
                            marginBottom: "1rem",
                          }}
                        >
                          <Heart size={28} fill="var(--rose)" />
                        </div>
                        <p
                          style={{
                            margin: "0 0 1rem 0",
                            color: "var(--fg-soft)",
                            fontSize: "0.95rem",
                          }}
                        >
                          Danh sách yêu thích của bạn đang trống
                        </p>
                        <Link
                          to="/products"
                          className="btn btn-sm btn--indigo"
                          style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "20px",
                          }}
                        >
                          Mua sắm ngay
                        </Link>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: "1.2rem",
                        }}
                      >
                        {wishlistProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WALLET TAB */}
              {activeTab === "wallet" && (
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
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      Ví điện tử Sprylo
                      <button
                        className="btn btn-sm btn--ghost"
                        onClick={() => setShowTopupModal(true)}
                      >
                        Nạp tiền vào ví
                      </button>
                    </div>

                    <div
                      className="wallet-card-bg"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--indigo) 0%, var(--card-purple) 100%)",
                        borderRadius: "var(--r-lg)",
                        padding: "2rem",
                        color: "white",
                        marginBottom: "2rem",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "relative", zIndex: 2 }}>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            opacity: 0.8,
                            marginBottom: "0.5rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Số dư khả dụng
                        </div>
                        <div
                          style={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            fontFamily: "var(--ff-display)",
                          }}
                        >
                          {walletData
                            ? formatPrice(Number(walletData.balance))
                            : "Đang tải..."}
                        </div>
                        <div
                          style={{
                            marginTop: "2rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                              Chủ tài khoản
                            </div>
                            <div
                              style={{ fontWeight: 600, letterSpacing: "1px" }}
                            >
                              {lastName.toUpperCase()} {firstName.toUpperCase()}
                            </div>
                          </div>
                          <Wallet size={36} style={{ opacity: 0.5 }} />
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          right: "-10%",
                          top: "-20%",
                          width: "200px",
                          height: "200px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "50%",
                          zIndex: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          right: "20%",
                          bottom: "-30%",
                          width: "150px",
                          height: "150px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "50%",
                          zIndex: 1,
                        }}
                      ></div>
                    </div>

                    <h4
                      style={{
                        fontFamily: "var(--ff-display)",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      Lịch sử giao dịch
                    </h4>

                    {walletData?.transactions?.length > 0 ? (
                      <div className="wallet-transactions">
                        {[...walletData.transactions]
                          .sort(
                            (a, b) =>
                              new Date(b.created_at).getTime() -
                              new Date(a.created_at).getTime(),
                          )
                          .map((tx: any) => (
                            <div
                              key={tx.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 0",
                                borderBottom: "1px solid var(--rule)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "1rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background:
                                      tx.type === "payment"
                                        ? "var(--rose-soft)"
                                        : "var(--emerald-soft, #d1fae5)",
                                    color:
                                      tx.type === "payment"
                                        ? "var(--rose)"
                                        : "var(--emerald)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {tx.type === "payment" ? (
                                    <Wallet size={18} />
                                  ) : (
                                    <CheckCircle size={18} />
                                  )}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      color: "var(--ink)",
                                    }}
                                  >
                                    {tx.description ||
                                      (tx.type === "payment"
                                        ? "Thanh toán đơn hàng"
                                        : "Nạp tiền / Hoàn tiền")}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "var(--fg-mute)",
                                    }}
                                  >
                                    {new Date(tx.created_at).toLocaleString(
                                      "vi-VN",
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color:
                                    tx.type === "payment"
                                      ? "var(--ink)"
                                      : "var(--emerald)",
                                }}
                              >
                                {tx.type === "payment" ? "-" : "+"}
                                {formatPrice(Number(tx.amount))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--fg-mute)",
                          background: "var(--bg-soft)",
                          borderRadius: "var(--r)",
                        }}
                      >
                        Chưa có giao dịch nào
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASSWORD TAB */}
              {activeTab === "password" && (
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
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "1.5rem",
                        paddingBottom: "0.8rem",
                        borderBottom: "1px solid var(--rule)",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background:
                            "linear-gradient(135deg, var(--indigo) 0%, #7c3aed 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        <Shield size={20} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--ff-display)",
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            lineHeight: 1.2,
                          }}
                        >
                          Đổi mật khẩu
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--fg-mute)",
                            marginTop: "2px",
                          }}
                        >
                          Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                        </div>
                      </div>
                    </div>

                    {/* Security tips */}
                    <div
                      style={{
                        background: "var(--indigo-soft, #eef2ff)",
                        border: "1px solid var(--indigo-line, #c7d2fe)",
                        borderRadius: "var(--r)",
                        padding: "1rem 1.2rem",
                        marginBottom: "1.8rem",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertCircle
                        size={16}
                        style={{
                          color: "var(--indigo)",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--indigo-dark, #3730a3)",
                          lineHeight: 1.6,
                        }}
                      >
                        <strong>Lưu ý bảo mật:</strong> Mật khẩu nên có ít nhất
                        8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt. Không
                        chia sẻ mật khẩu với bất kỳ ai.
                      </div>
                    </div>

                    {/* Error alert */}
                    {pwError && (
                      <div
                        className="alert alert-danger"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "1.4rem",
                        }}
                      >
                        <AlertCircle
                          size={16}
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        <span>{pwError}</span>
                      </div>
                    )}

                    {/* Success alert */}
                    {pwSuccess && (
                      <div
                        className="alert alert-success"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "1.4rem",
                        }}
                      >
                        <CheckCircle size={16} />
                        <span>
                          Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho lần
                          đăng nhập tiếp theo.
                        </span>
                      </div>
                    )}

                    <div style={{ maxWidth: "480px" }}>
                      {/* Old password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="old-pw">
                          Mật khẩu hiện tại *
                        </label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="old-pw"
                            type={showOldPw ? "text" : "password"}
                            className={`form-control ${pwFieldErrors.old ? "is-invalid" : ""}`}
                            placeholder="Nhập mật khẩu hiện tại..."
                            value={oldPassword}
                            onChange={(e) => {
                              setOldPassword(e.target.value);
                              setPwFieldErrors((p) => ({
                                ...p,
                                old: undefined,
                              }));
                              setPwError("");
                            }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button
                            type="button"
                            className="toggle-pw"
                            onClick={() => setShowOldPw((v) => !v)}
                            tabIndex={-1}
                          >
                            {showOldPw ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>
                        {pwFieldErrors.old && (
                          <div
                            className="form-error"
                            style={{ marginTop: "4px" }}
                          >
                            {pwFieldErrors.old}
                          </div>
                        )}
                      </div>

                      {/* New password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pw">
                          Mật khẩu mới *
                        </label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="new-pw"
                            type={showNewPw ? "text" : "password"}
                            className={`form-control ${pwFieldErrors.new ? "is-invalid" : ""}`}
                            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)..."
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPwFieldErrors((p) => ({
                                ...p,
                                new: undefined,
                              }));
                              setPwError("");
                            }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button
                            type="button"
                            className="toggle-pw"
                            onClick={() => setShowNewPw((v) => !v)}
                            tabIndex={-1}
                          >
                            {showNewPw ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>
                        {pwFieldErrors.new && (
                          <div
                            className="form-error"
                            style={{ marginTop: "4px" }}
                          >
                            {pwFieldErrors.new}
                          </div>
                        )}

                        {/* Password strength bar */}
                        {newPassword && (
                          <div style={{ marginTop: "8px" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    height: "4px",
                                    borderRadius: "4px",
                                    background:
                                      i <= pwStrength.score
                                        ? pwStrength.color
                                        : "var(--rule)",
                                    transition: "background 0.3s",
                                  }}
                                />
                              ))}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: pwStrength.color,
                                fontWeight: 600,
                              }}
                            >
                              Độ mạnh: {pwStrength.label}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm new password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="confirm-pw">
                          Xác nhận mật khẩu mới *
                        </label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="confirm-pw"
                            type={showConfirmPw ? "text" : "password"}
                            className={`form-control ${
                              pwFieldErrors.confirm
                                ? "is-invalid"
                                : confirmNewPassword &&
                                    confirmNewPassword === newPassword
                                  ? "is-valid"
                                  : ""
                            }`}
                            placeholder="Nhập lại mật khẩu mới..."
                            value={confirmNewPassword}
                            onChange={(e) => {
                              setConfirmNewPassword(e.target.value);
                              setPwFieldErrors((p) => ({
                                ...p,
                                confirm: undefined,
                              }));
                            }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button
                            type="button"
                            className="toggle-pw"
                            onClick={() => setShowConfirmPw((v) => !v)}
                            tabIndex={-1}
                          >
                            {showConfirmPw ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>
                        {pwFieldErrors.confirm && (
                          <div
                            className="form-error"
                            style={{ marginTop: "4px" }}
                          >
                            {pwFieldErrors.confirm}
                          </div>
                        )}
                        {confirmNewPassword &&
                          confirmNewPassword === newPassword &&
                          !pwFieldErrors.confirm && (
                            <div
                              style={{
                                marginTop: "4px",
                                fontSize: "0.78rem",
                                color: "var(--emerald)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <CheckCircle size={13} /> Mật khẩu khớp
                            </div>
                          )}
                      </div>

                      {/* Submit */}
                      <div
                        className="flex-center"
                        style={{
                          justifyContent: "flex-end",
                          gap: "0.8rem",
                          marginTop: "2rem",
                        }}
                      >
                        <button
                          className="btn btn--ghost"
                          onClick={() => {
                            setOldPassword("");
                            setNewPassword("");
                            setConfirmNewPassword("");
                            setPwFieldErrors({});
                            setPwError("");
                            setPwSuccess(false);
                          }}
                          disabled={pwLoading}
                        >
                          Hủy
                        </button>
                        <button
                          id="change-password-submit"
                          className="btn btn--indigo"
                          onClick={handleChangePassword}
                          disabled={pwLoading || pwSuccess}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: "180px",
                            justifyContent: "center",
                            opacity: pwLoading || pwSuccess ? 0.8 : 1,
                          }}
                        >
                          {pwLoading ? (
                            <>
                              <Loader2
                                size={18}
                                style={{ animation: "spin 1s linear infinite" }}
                              />{" "}
                              Đang cập nhật...
                            </>
                          ) : pwSuccess ? (
                            <>
                              <CheckCircle size={18} /> Đã cập nhật!
                            </>
                          ) : (
                            <>
                              <Shield size={18} /> Cập nhật mật khẩu
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* POLICIES TAB (Seller) */}
              {activeTab === "policies" && (
                <div id="tab-policies" className="tab-panel active">
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
                      Quản lý Chính sách Sản phẩm (Seller)
                    </div>
                    <p
                      className="text-muted"
                      style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}
                    >
                      Thiết lập các chính sách bảo hành và đổi trả áp dụng cho
                      các sản phẩm của bạn. Các thay đổi sẽ được hiển thị ngay
                      trên trang chi tiết sản phẩm.
                    </p>

                    <div style={{ marginBottom: "2rem" }}>
                      <div className="form-group">
                        <label className="form-label">
                          Chọn sản phẩm cần áp dụng:
                        </label>
                        <select
                          className="form-control"
                          style={{ maxWidth: "400px" }}
                        >
                          <option>— Áp dụng cho tất cả sản phẩm —</option>
                          <option>iPhone 15 Pro Max</option>
                          <option>Samsung Galaxy S24 Ultra</option>
                          <option>MacBook Pro M3</option>
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">
                            Chính sách bảo hành
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: BH 12 tháng chính hãng"
                            defaultValue="BH 12 tháng chính hãng"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Chính sách đổi trả
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: Đổi trả 30 ngày"
                            defaultValue="Đổi trả 30 ngày"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Chi tiết chính sách (Mô tả chi tiết)
                        </label>
                        <textarea
                          className="form-control"
                          rows={4}
                          defaultValue="Dòng sản phẩm chính hãng Apple Việt Nam. Đổi mới trong 30 ngày đầu nếu có lỗi phần cứng từ nhà sản xuất. Bảo hành 12 tháng tại các trung tâm bảo hành ủy quyền của Apple trên toàn quốc."
                        ></textarea>
                      </div>

                      <button
                        className="btn btn--indigo"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Check size={18} /> Cập nhật chính sách
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="address-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="address-modal-container"
            >
              <div className="address-modal-header">
                <h3>
                  {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                <button
                  className="close-btn"
                  onClick={() => setShowAddressModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body">
                <div className="form-row">
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.2rem" }}
                  >
                    <label className="form-label">Họ và tên người nhận *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nguyễn Văn A"
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                    />
                  </div>
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.2rem" }}
                  >
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="09xx xxx xxx"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.2rem" }}
                  >
                    <label className="form-label">Tỉnh / Thành phố *</label>
                    <select
                      className="form-control"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.2rem" }}
                  >
                    <label className="form-label">Phường / Xã *</label>
                    <select
                      className="form-control"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Số nhà, tên đường..."
                    value={addrDetail}
                    onChange={(e) => setAddrDetail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label">Loại địa chỉ</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    {["Nhà riêng", "Văn phòng", "Khác"].map((label) => (
                      <label
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          fontWeight: 500,
                          color: "var(--fg-soft)",
                        }}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value={label}
                          checked={addrCompany === label}
                          onChange={() => setAddrCompany(label)}
                          style={{ accentColor: "var(--indigo)" }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {(!editingAddress || !editingAddress.is_default_shipping) && (
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.2rem" }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        fontWeight: 500,
                        color: "var(--fg-soft)",
                        marginTop: "0.8rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        style={{ accentColor: "var(--indigo)" }}
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                )}
              </div>
              <div className="address-modal-footer">
                <button
                  className="btn btn--ghost"
                  onClick={() => setShowAddressModal(false)}
                >
                  Hủy
                </button>
                <button className="btn btn--indigo" onClick={handleSaveAddress}>
                  Lưu địa chỉ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCELLATION REASON MODAL */}
      <AnimatePresence>
        {cancelModalOrderId && (
          <div className="address-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="address-modal-container"
              style={{ maxWidth: "500px" }}
            >
              <div
                className="address-modal-header"
                style={{ borderBottom: "1px solid var(--rule)" }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#dc2626",
                  }}
                >
                  <i className="bi bi-x-circle-fill"></i> Lý do hủy đơn hàng
                </h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setCancelModalOrderId(null);
                    setCancelRefundDestination("");
                    setCancelRefundInfo("");
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body" style={{ padding: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--fg-soft)",
                    marginBottom: "1.2rem",
                    lineHeight: 1.5,
                  }}
                >
                  Vui lòng chọn lý do hủy đơn hàng{" "}
                  <strong>#{formatOrderId(cancelModalOrderId)}</strong>. Ý kiến
                  của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {[
                    "Thay đổi ý định mua sắm / Không còn nhu cầu",
                    "Tìm thấy sản phẩm với giá rẻ hơn ở nơi khác",
                    "Thời gian giao hàng dự kiến quá lâu",
                    "Muốn thay đổi thông tin đơn hàng (địa chỉ, số điện thoại, sản phẩm...)",
                    "Lý do khác",
                  ].map((reason) => (
                    <label
                      key={reason}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        fontWeight: 500,
                        color: "var(--ink)",
                        padding: "0.8rem 1rem",
                        border:
                          cancelReason === reason
                            ? "1.5px solid var(--indigo)"
                            : "1.5px solid var(--rule)",
                        borderRadius: "10px",
                        background:
                          cancelReason === reason
                            ? "var(--indigo-soft)"
                            : "white",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={() => setCancelReason(reason)}
                        style={{
                          accentColor: "var(--indigo)",
                          marginTop: "3px",
                        }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === "Lý do khác" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ marginTop: "1rem" }}
                  >
                    <label
                      className="form-label"
                      style={{ marginBottom: "0.4rem", fontSize: "0.78rem" }}
                    >
                      Chi tiết lý do khác *
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Vui lòng nhập lý do cụ thể..."
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                      style={{ borderRadius: "8px", resize: "none" }}
                    />
                  </motion.div>
                )}

                {(() => {
                  const orderToCancel = realOrders.find(o => o.orderId === cancelModalOrderId);
                  const isPaid = orderToCancel && orderToCancel.paymentMethod !== "cod";
                  if (isPaid) {
                    return (
                      <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px" }}>
                        <p style={{ fontSize: "0.85rem", color: "#b45309", marginBottom: "0.8rem", fontWeight: 600 }}>
                          <i className="bi bi-exclamation-triangle-fill"></i> Đơn hàng này đã được thanh toán. Vui lòng chọn phương thức nhận tiền hoàn:
                        </p>
                        <select
                          className="form-control"
                          value={cancelRefundDestination}
                          onChange={(e) => setCancelRefundDestination(e.target.value as "wallet" | "bank_transfer")}
                          style={{ marginBottom: "0.8rem" }}
                        >
                          <option value="">-- Chọn phương thức hoàn tiền --</option>
                          <option value="wallet">Hoàn vào Ví Sprylo (Nhanh nhất)</option>
                          <option value="bank_transfer">Chuyển khoản Ngân hàng</option>
                        </select>
                        {cancelRefundDestination === "bank_transfer" && (
                          <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Nhập thông tin ngân hàng (Tên Ngân hàng, Số Tài khoản, Chủ Tài khoản)..."
                            value={cancelRefundInfo}
                            onChange={(e) => setCancelRefundInfo(e.target.value)}
                            style={{ borderRadius: "8px", resize: "none" }}
                          />
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

              </div>
              <div className="address-modal-footer">
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setCancelModalOrderId(null);
                    setCancelRefundDestination("");
                    setCancelRefundInfo("");
                  }}
                >
                  Quay lại
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onClick={() => {
                    const orderToCancel = realOrders.find(o => o.orderId === cancelModalOrderId);
                    const isPaid = orderToCancel && orderToCancel.paymentMethod !== "cod";
                    
                    const finalReason =
                      cancelReason === "Lý do khác"
                        ? customCancelReason
                        : cancelReason;
                    if (!finalReason || !finalReason.trim()) {
                      alert("Vui lòng chọn hoặc nhập lý do hủy đơn hàng.");
                      return;
                    }
                    if (isPaid && !cancelRefundDestination) {
                      alert("Vui lòng chọn phương thức hoàn tiền.");
                      return;
                    }
                    if (isPaid && cancelRefundDestination === "bank_transfer" && !cancelRefundInfo.trim()) {
                      alert("Vui lòng nhập thông tin ngân hàng để nhận hoàn tiền.");
                      return;
                    }
                    handleCancelOrder(cancelModalOrderId, finalReason, cancelRefundDestination, cancelRefundInfo);
                  }}
                  disabled={cancelingOrderId === cancelModalOrderId}
                >
                  {cancelingOrderId === cancelModalOrderId
                    ? "Đang hủy..."
                    : "Xác nhận hủy đơn"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Return Modal */}
        {returnModalOrderId && (
          <div className="address-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="address-modal-container"
              style={{ maxWidth: '500px' }}
            >
              <div className="address-modal-header" style={{ borderBottom: '1px solid var(--rule)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
                  <i className="bi bi-arrow-return-left"></i> Lý do trả hàng
                </h3>
                <button className="close-btn" onClick={() => setReturnModalOrderId(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--fg-soft)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  Vui lòng chọn lý do trả hàng cho đơn <strong>#{formatOrderId(returnModalOrderId)}</strong>. Yêu cầu của bạn sẽ được gửi tới Admin để phê duyệt.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    "Hàng lỗi / Không hoạt động",
                    "Giao sai sản phẩm / Thiếu phụ kiện",
                    "Sản phẩm khác với mô tả",
                    "Hàng hỏng hóc do vận chuyển",
                    "Lý do khác"
                  ].map((reason) => (
                    <label 
                      key={reason} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px', 
                        fontSize: '0.9rem', 
                        cursor: 'pointer', 
                        fontWeight: 500, 
                        color: 'var(--ink)',
                        padding: '0.8rem 1rem',
                        border: returnReason === reason ? '1.5px solid var(--amber-600)' : '1.5px solid var(--rule)',
                        borderRadius: '10px',
                        background: returnReason === reason ? '#fffbeb' : 'white',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="returnReason" 
                        value={reason}
                        checked={returnReason === reason}
                        onChange={() => setReturnReason(reason)}
                        style={{ accentColor: '#d97706', marginTop: '3px' }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {returnReason === "Lý do khác" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: '1rem' }}
                  >
                    <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.78rem' }}>Chi tiết lý do khác *</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Vui lòng nhập lý do cụ thể..." 
                      value={customReturnReason}
                      onChange={(e) => setCustomReturnReason(e.target.value)}
                      style={{ borderRadius: '8px', resize: 'none' }}
                    />
                  </motion.div>
                )}

                {(() => {
                  const modalOrder = realOrders.find(o => o.orderId === returnModalOrderId);
                  const pMethod = modalOrder?.metadata?.payment_method;
                  const isZalopayOrVnpay = pMethod === 'zalopay' || pMethod === 'vnpay';
                  if (!isZalopayOrVnpay) {
                    return (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--rule)' }}
                      >
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="bi bi-wallet2"></i> Phương thức nhận tiền hoàn
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="refundMethod" 
                              value="bank_transfer" 
                              checked={refundMethod === 'bank_transfer'} 
                              onChange={() => setRefundMethod('bank_transfer')} 
                              style={{ accentColor: '#d97706' }}
                            />
                            Chuyển khoản Ngân hàng
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="refundMethod" 
                              value="wallet" 
                              checked={refundMethod === 'wallet'} 
                              onChange={() => {
                                setRefundMethod('wallet');
                                setRefundAccountNumber('');
                                setRefundAccountName('');
                              }}
                              style={{ accentColor: '#d97706' }}
                            />
                            Ví điện tử Sprylo
                          </label>
                        </div>

                        {refundMethod === 'bank_transfer' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem' }}>Ngân Hàng *</label>
                              <Select
                                options={banks.map(bank => ({ value: bank.bin, label: `${bank.shortName} - ${bank.name}` }))}
                                value={refundBankName ? { value: refundBankName, label: banks.find(b => b.bin === refundBankName) ? `${banks.find(b => b.bin === refundBankName).shortName} - ${banks.find(b => b.bin === refundBankName).name}` : refundBankName } : null}
                                onChange={(selectedOption: any) => setRefundBankName(selectedOption ? selectedOption.value : '')}
                                placeholder="Chọn hoặc tìm ngân hàng..."
                                isClearable
                                isSearchable
                                styles={{
                                  control: (base: Record<string, unknown>) => ({
                                    ...base,
                                    borderRadius: '6px',
                                    borderColor: '#e5e7eb',
                                    boxShadow: 'none',
                                    '&:hover': {
                                      borderColor: '#d97706'
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem' }}>Số Tài Khoản *</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập số tài khoản" 
                                value={refundAccountNumber} 
                                onChange={e => setRefundAccountNumber(e.target.value)} 
                                style={{ borderRadius: '6px' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tên Chủ Tài Khoản *</span>
                                {isLookingUp && <span style={{ color: '#d97706', fontSize: '0.7rem' }}><i className="bi bi-arrow-repeat spin"></i> Đang tra cứu...</span>}
                              </label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder={isLookingUp ? "Đang lấy tên..." : "NGUYEN VAN A"} 
                                value={refundAccountName} 
                                onChange={e => setRefundAccountName(e.target.value.toUpperCase())} 
                                style={{ borderRadius: '6px', background: isLookingUp ? '#f3f4f6' : 'white' }} 
                                readOnly={isLookingUp}
                              />
                            </div>
                          </div>
                        )}

                        {refundMethod === 'wallet' && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                            Tiền hoàn sẽ được cộng vào Ví điện tử Sprylo của bạn sau khi yêu cầu được duyệt.
                          </p>
                        )}

                      </motion.div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="address-modal-footer">
                <button className="btn btn--ghost" onClick={() => setReturnModalOrderId(null)}>Quay lại</button>
                <button 
                  className="btn" 
                  style={{ background: '#d97706', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const finalReason = returnReason === 'Lý do khác' ? customReturnReason : returnReason;
                    if (!finalReason || !finalReason.trim()) {
                      alert("Vui lòng chọn hoặc nhập lý do trả hàng.");
                      return;
                    }
                    const modalOrder = realOrders.find(o => o.orderId === returnModalOrderId);
                    const pMethod = modalOrder?.metadata?.payment_method;
                    const isZalopayOrVnpay = pMethod === 'zalopay' || pMethod === 'vnpay';
                    
                    let compiledRefundInfo = '';
                    if (!isZalopayOrVnpay) {
                      if (refundMethod === 'bank_transfer') {
                        if (!refundBankName.trim() || !refundAccountNumber.trim() || !refundAccountName.trim()) {
                          alert("Vui lòng điền đầy đủ thông tin ngân hàng.");
                          return;
                        }
                        compiledRefundInfo = `Ngân hàng: ${refundBankName.trim()} - STK: ${refundAccountNumber.trim()} - Chủ thẻ: ${refundAccountName.trim()}`;
                      } else if (refundMethod === 'wallet') {
                        compiledRefundInfo = 'Ví điện tử Sprylo';
                      }
                    }

                    handleReturnOrder(returnModalOrderId, finalReason, compiledRefundInfo);
                  }}
                  disabled={returningOrderId === returnModalOrderId}
                >
                  {returningOrderId === returnModalOrderId ? 'Đang gửi...' : 'Gửi yêu cầu trả hàng'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Return Modal */}
        {returnModalOrderId && (
          <div className="address-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="address-modal-container"
              style={{ maxWidth: '500px' }}
            >
              <div className="address-modal-header" style={{ borderBottom: '1px solid var(--rule)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
                  <i className="bi bi-arrow-return-left"></i> Lý do trả hàng
                </h3>
                <button className="close-btn" onClick={() => setReturnModalOrderId(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--fg-soft)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  Vui lòng chọn lý do trả hàng cho đơn <strong>#{formatOrderId(returnModalOrderId)}</strong>. Yêu cầu của bạn sẽ được gửi tới Admin để phê duyệt.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    "Hàng lỗi / Không hoạt động",
                    "Giao sai sản phẩm / Thiếu phụ kiện",
                    "Sản phẩm khác với mô tả",
                    "Hàng hỏng hóc do vận chuyển",
                    "Lý do khác"
                  ].map((reason) => (
                    <label 
                      key={reason} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px', 
                        fontSize: '0.9rem', 
                        cursor: 'pointer', 
                        fontWeight: 500, 
                        color: 'var(--ink)',
                        padding: '0.8rem 1rem',
                        border: returnReason === reason ? '1.5px solid var(--amber-600)' : '1.5px solid var(--rule)',
                        borderRadius: '10px',
                        background: returnReason === reason ? '#fffbeb' : 'white',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="returnReason" 
                        value={reason}
                        checked={returnReason === reason}
                        onChange={() => setReturnReason(reason)}
                        style={{ accentColor: '#d97706', marginTop: '3px' }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {returnReason === "Lý do khác" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: '1rem' }}
                  >
                    <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.78rem' }}>Chi tiết lý do khác *</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Vui lòng nhập lý do cụ thể..." 
                      value={customReturnReason}
                      onChange={(e) => setCustomReturnReason(e.target.value)}
                      style={{ borderRadius: '8px', resize: 'none' }}
                    />
                  </motion.div>
                )}

                {(() => {



                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--rule)' }}
                    >
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-wallet2"></i> Phương thức nhận tiền hoàn
                      </h4>


                      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer',
                          padding: '0.7rem 1rem', borderRadius: '10px', flex: 1,
                          border: refundDestination === 'wallet' ? '2px solid #7c3aed' : '1.5px solid var(--rule)',
                          background: refundDestination === 'wallet' ? '#f5f3ff' : 'white',
                          transition: 'all 0.15s ease'
                        }}>
                          <input 
                            type="radio" 
                            name="refundDestination" 
                            value="wallet" 
                            checked={refundDestination === 'wallet'} 
                            onChange={() => setRefundDestination('wallet')} 
                            style={{ accentColor: '#7c3aed' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: refundDestination === 'wallet' ? '#7c3aed' : 'var(--ink)' }}>
                              <i className="bi bi-wallet2" style={{ marginRight: '4px' }}></i> Ví Sprylo
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--fg-mute)', marginTop: '2px' }}>Nhận tiền ngay lập tức</div>
                          </div>
                        </label>
                        <label style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer',
                          padding: '0.7rem 1rem', borderRadius: '10px', flex: 1,
                          border: refundDestination === 'bank_transfer' ? '2px solid #d97706' : '1.5px solid var(--rule)',
                          background: refundDestination === 'bank_transfer' ? '#fffbeb' : 'white',
                          transition: 'all 0.15s ease'
                        }}>
                          <input 
                            type="radio" 
                            name="refundDestination" 
                            value="bank_transfer" 
                            checked={refundDestination === 'bank_transfer'} 
                            onChange={() => setRefundDestination('bank_transfer')} 
                            style={{ accentColor: '#d97706' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: refundDestination === 'bank_transfer' ? '#d97706' : 'var(--ink)' }}>
                              <i className="bi bi-bank" style={{ marginRight: '4px' }}></i> Ngân hàng
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--fg-mute)', marginTop: '2px' }}>Chuyển khoản 1-3 ngày</div>
                          </div>
                        </label>
                      </div>

                      {refundDestination === 'wallet' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ background: '#f5f3ff', borderRadius: '10px', padding: '1rem 1.2rem', border: '1px solid #ddd6fe' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem' }}>
                              <i className="bi bi-wallet-fill"></i>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.95rem' }}>Hoàn tiền về Ví Sprylo</div>
                              <div style={{ fontSize: '0.8rem', color: '#7c3aed' }}>
                                Số dư ví sẽ được cộng ngay sau khi admin duyệt hoàn tiền. Bạn có thể sử dụng số dư ví để thanh toán các đơn hàng tiếp theo.
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {refundDestination === 'bank_transfer' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem' }}>Ngân Hàng *</label>
                              <Select
                                options={banks.map(bank => ({ value: bank.bin, label: `${bank.shortName} - ${bank.name}` }))}
                                value={refundBankName ? { value: refundBankName, label: banks.find(b => b.bin === refundBankName) ? `${banks.find(b => b.bin === refundBankName).shortName} - ${banks.find(b => b.bin === refundBankName).name}` : refundBankName } : null}
                                onChange={(selectedOption: any) => setRefundBankName(selectedOption ? selectedOption.value : '')}
                                placeholder="Chọn hoặc tìm ngân hàng..."
                                isClearable
                                isSearchable
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    borderRadius: '6px',
                                    borderColor: '#e5e7eb',
                                    boxShadow: 'none',
                                    '&:hover': {
                                      borderColor: '#d97706'
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem' }}>Số Tài Khoản *</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập số tài khoản" 
                                value={refundAccountNumber} 
                                onChange={e => setRefundAccountNumber(e.target.value)} 
                                style={{ borderRadius: '6px' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tên Chủ Tài Khoản *</span>
                                {isLookingUp && <span style={{ color: '#d97706', fontSize: '0.7rem' }}><i className="bi bi-arrow-repeat spin"></i> Đang tra cứu...</span>}
                              </label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder={isLookingUp ? "Đang lấy tên..." : "NGUYEN VAN A"} 
                                value={refundAccountName} 
                                onChange={e => setRefundAccountName(e.target.value.toUpperCase())} 
                                style={{ borderRadius: '6px', background: isLookingUp ? '#f3f4f6' : 'white' }} 
                                readOnly={isLookingUp}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </motion.div>
                  );
                })()}
              </div>
              <div className="address-modal-footer">
                <button className="btn btn--ghost" onClick={() => setReturnModalOrderId(null)}>Quay lại</button>
                <button 
                  className="btn" 
                  style={{ background: '#d97706', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const finalReason = returnReason === 'Lý do khác' ? customReturnReason : returnReason;
                    if (!finalReason || !finalReason.trim()) {
                      alert("Vui lòng chọn hoặc nhập lý do trả hàng.");
                      return;
                    }
                    
                    let compiledRefundInfo = '';
                    if (refundDestination === 'bank_transfer') {
                      if (!refundBankName.trim() || !refundAccountNumber.trim() || !refundAccountName.trim()) {
                        alert("Vui lòng điền đầy đủ thông tin ngân hàng.");
                        return;
                      }
                      compiledRefundInfo = `Ngân hàng: ${refundBankName.trim()} - STK: ${refundAccountNumber.trim()} - Chủ thẻ: ${refundAccountName.trim()}`;
                    }

                    if (!returnModalOrderId) return;
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
