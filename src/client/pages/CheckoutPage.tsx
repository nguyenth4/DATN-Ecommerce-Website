import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  Lock,
  User,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  Wallet,
} from "lucide-react";
import "./CheckoutPage.css";
import { getCart, clearCart } from "../utils/cart";
import type { CartItem } from "../utils/cart";
import { authService } from "../services/auth.service";
import { walletService } from "../services/wallet.service";
import { showToast } from "../utils/compare";

const validateEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v: string) =>
  /^(0|\+84)[0-9]{8,10}$/.test(v.replace(/\s/g, ""));

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  "pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483";

interface Location {
  id: string;
  name: string;
}

interface MedusaAddress {
  id: string;
  company?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  is_default_shipping?: boolean;
  metadata?: Record<string, any>;
}

interface MedusaCustomer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  addresses?: MedusaAddress[];
}

interface SavedAddress {
  id: string;
  name: string;
  fullName: string;
  phone: string;
  mergedAddress: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [shippingMethod, setShippingMethod] = useState("ghn");

  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;

  // Cart & Stock State
  const [cartItems] = useState<CartItem[]>(() => {
    if (buyNowItem) return [buyNowItem];
    return getCart();
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate stock when cart items change
  useEffect(() => {
    if (validationErrors.length > 0) {
      setTimeout(() => {
        setValidationErrors([]);
      }, 0);
    }
  }, [cartItems, validationErrors.length]);

  const [promoCode, setPromoCode] = useState(
    () => localStorage.getItem("applied_promo_code") || "",
  );
  const [promoDiscount, setPromoDiscount] = useState(() =>
    Number(localStorage.getItem("applied_promo_discount") || 0),
  );

  // Automatically fetch active automatic promotions if no promo code is applied
  useEffect(() => {
    const fetchAutoPromo = async () => {
      if (promoCode || cartItems.length === 0) return;
      try {
        const response = await fetch(
          `${MEDUSA_BACKEND_URL}/store/promotions/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              code: "",
              items: cartItems.map((item) => ({
                id: item.id,
                productId: item.productId,
                price: item.price,
                qty: item.qty,
              })),
            }),
          },
        );

        const data = await response.json();
        if (response.ok && data.success && data.isAutomatic) {
          setPromoCode(data.code);
          setPromoDiscount(data.discount);
          localStorage.setItem("applied_promo_code", data.code);
          localStorage.setItem(
            "applied_promo_discount",
            data.discount.toString(),
          );
        }
      } catch (err) {
        console.error("Failed to check automatic promo on checkout page:", err);
      }
    };

    fetchAutoPromo();
  }, [cartItems, promoCode]);

  // Auth & Guest States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(
    !!location.state?.buyNowItem,
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [customer, setCustomer] = useState<MedusaCustomer | null>(null);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "guest">(
    "login",
  );

  // Inline Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Inline Register Form State
  const [regLastName, setRegLastName] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  // Location State
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Customer & Address State (Persistent)
  const [fullName, setFullName] = useState(
    () => localStorage.getItem("checkout_fullName") || "",
  );
  const [phoneNumber, setPhoneNumber] = useState(
    () => localStorage.getItem("checkout_phoneNumber") || "",
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem("checkout_email") || "",
  );
  const [detailAddress, setDetailAddress] = useState(
    () => localStorage.getItem("checkout_detailAddress") || "",
  );
  const [note, setNote] = useState(
    () => localStorage.getItem("checkout_note") || "",
  );

  useEffect(() => {
    localStorage.setItem("checkout_fullName", fullName);
    localStorage.setItem("checkout_phoneNumber", phoneNumber);
    localStorage.setItem("checkout_email", email);
    localStorage.setItem("checkout_detailAddress", detailAddress);
    localStorage.setItem("checkout_note", note);
  }, [fullName, phoneNumber, email, detailAddress, note]);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressMode, setAddressMode] = useState<"saved" | "new">("new");
  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string>("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState("");

  // Fetch customer profile & load saved addresses
  const fetchCustomerProfile = async () => {
    try {
      const res = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/customers/me?fields=*addresses`,
      );
      if (res.ok) {
        const { customer } = await res.json();
        if (customer) {
          setIsLoggedIn(true);
          setCustomer(customer);
          setFullName(
            `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
          );
          setPhoneNumber(customer.phone || "");
          setEmail(customer.email || "");

          // Save customer info to localStorage to keep global header in sync
          localStorage.setItem(
            "customer_info",
            JSON.stringify({
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
            }),
          );
          window.dispatchEvent(new Event("customer-auth-change"));

          if (customer.addresses && customer.addresses.length > 0) {
            const mapped = customer.addresses.map((addr: MedusaAddress) => {
              const provinceStr = addr.province || "";
              const districtStr =
                addr.city && addr.city !== "Toàn khu vực" ? addr.city : "";
              const wardStr = addr.address_2 || "";
              const detailStr = addr.address_1 || "";
              const merged = [detailStr, wardStr, districtStr, provinceStr]
                .filter((p) => p && p.trim() !== "")
                .join(", ");

              return {
                id: addr.id,
                name: addr.company || "Địa chỉ",
                fullName:
                  `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
                phone: addr.phone || "",
                mergedAddress: merged,
                isDefault: addr.is_default_shipping || false,
                metadata: addr.metadata,
              };
            });
            setSavedAddresses(mapped);
            setAddressMode("saved");
            const defaultAddr = mapped.find((a: SavedAddress) => a.isDefault);
            if (defaultAddr) {
              setSelectedSavedAddressId(defaultAddr.id);
            } else {
              setSelectedSavedAddressId(mapped[0].id);
            }
          } else {
            setSavedAddresses([]);
            setAddressMode("new");
          }

          try {
            const wData = await walletService.getWallet(customer.id);
            if (wData?.wallet) {
              setWalletBalance(Number(wData.wallet.balance) || 0);
            }
          } catch (wErr) {
            console.error("Error loading wallet balance:", wErr);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching customer profile:", err);
    }
  };

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      setIsLoadingProfile(true);
      const token = await authService.getValidToken();
      if (token) {
        await fetchCustomerProfile();
      } else {
        setIsLoggedIn(false);
        // Bỏ redirect để có thể sử dụng màn hình Checkout dạng Guest / Form đăng nhập nội tuyến
      }
      setIsLoadingProfile(false);
    };
    checkAuthAndProfile();
  }, [navigate]);

  // Inline Login Handler
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim() || !validateEmail(loginEmail)) {
      setLoginError("Email không hợp lệ.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          setLoginError("Email hoặc mật khẩu không chính xác.");
        } else {
          setLoginError("Đăng nhập thất bại. Vui lòng thử lại.");
        }
        setLoginLoading(false);
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("customer_token", token);

      // Fetch customer profile & details
      const meRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      if (meRes.ok) {
        const { customer } = await meRes.json();
        if (customer) {
          localStorage.setItem(
            "customer_info",
            JSON.stringify({
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
            }),
          );
        }
      }

      window.dispatchEvent(new Event("customer-auth-change"));
      await fetchCustomerProfile();
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setLoginError("Lỗi kết nối máy chủ.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Inline Register Handler
  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regLastName.trim() || !regFirstName.trim()) {
      setRegError("Vui lòng nhập đầy đủ họ và tên.");
      return;
    }
    if (!validateEmail(regEmail)) {
      setRegError("Email không hợp lệ.");
      return;
    }
    if (!validatePhone(regPhone)) {
      setRegError("Số điện thoại không hợp lệ.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setRegLoading(true);
    try {
      const regRes = await fetch(
        `${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email: regEmail.trim(),
            password: regPassword,
          }),
        },
      );

      if (!regRes.ok) {
        const errData = await regRes.json().catch(() => ({}));
        let msg = errData?.message || "";
        if (
          msg.includes("Identity with email already exists") ||
          regRes.status === 409
        ) {
          msg = "Email này đã được đăng ký. Vui lòng đăng nhập.";
        } else if (!msg) {
          msg = "Đăng ký thất bại. Vui lòng thử lại.";
        }
        setRegError(msg);
        setRegLoading(false);
        return;
      }

      const { token } = await regRes.json();

      const customerRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: regFirstName.trim(),
          last_name: regLastName.trim(),
          email: regEmail.trim(),
          phone: regPhone.replace(/\s/g, ""),
        }),
      });

      if (!customerRes.ok) {
        setRegError("Tạo hồ sơ khách hàng thất bại. Vui lòng thử lại.");
        setRegLoading(false);
        return;
      }

      // Auto login
      localStorage.setItem("customer_token", token);
      localStorage.setItem(
        "customer_info",
        JSON.stringify({
          email: regEmail.trim(),
          first_name: regFirstName.trim(),
          last_name: regLastName.trim(),
          phone: regPhone.replace(/\s/g, ""),
        }),
      );
      window.dispatchEvent(new Event("customer-auth-change"));
      await fetchCustomerProfile();
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setRegError("Lỗi kết nối máy chủ.");
    } finally {
      setRegLoading(false);
    }
  };

  // Inline Social Login
  const handleSocialLogin = (provider: "google" | "facebook") => {
    localStorage.setItem("oauth_return_to", "/checkout");
    const callbackUrl = `${window.location.origin}/auth/callback?_type=${provider}`;

    fetch(`${MEDUSA_BACKEND_URL}/auth/customer/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ callback_url: callbackUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.location) {
          window.location.href = data.location;
        } else {
          setLoginError(
            `Không thể kết nối đến ${provider === "google" ? "Google" : "Facebook"}.`,
          );
        }
      })
      .catch(() => {
        setLoginError("Không thể kết nối đến máy chủ.");
      });
  };

  // Computed Merged Address
  const provinceName =
    provinces.find((p) => p.id === selectedProvince)?.name || "";
  const districtName =
    districts.find((d) => d.id === selectedDistrict)?.name || "";
  const wardName = wards.find((w) => w.id === selectedWard)?.name || "";

  const mergedAddress = [
    detailAddress,
    wardName,
    districtName !== "Toàn khu vực" ? districtName : "",
    provinceName,
  ]
    .filter((part) => part && part.trim() !== "")
    .join(", ");

  const finalOrderAddress =
    addressMode === "saved"
      ? savedAddresses.find((a) => a.id === selectedSavedAddressId)
          ?.mergedAddress
      : mergedAddress;

  const finalOrderFullName =
    addressMode === "saved"
      ? savedAddresses.find((a) => a.id === selectedSavedAddressId)?.fullName
      : fullName;

  const finalOrderPhone =
    addressMode === "saved"
      ? savedAddresses.find((a) => a.id === selectedSavedAddressId)?.phone
      : phoneNumber;

  // Fetch Provinces on mount (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    fetch("/api/cas/address-kit/2025-07-01/provinces")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.provinces || (Array.isArray(data) ? data : []);
        setProvinces(
          list.map((p: { code: string; name: string }) => ({
            id: p.code,
            name: p.name,
          })),
        );
      })
      .catch((err) =>
        console.error("Error fetching provinces from AddressKit:", err),
      );
  }, []);

  // Fetch Communes when Province changes (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    if (selectedProvince) {
      fetch(
        `/api/cas/address-kit/2025-07-01/provinces/${selectedProvince}/communes`,
      )
        .then((res) => res.json())
        .then((data) => {
          const list = data?.communes || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setWards(
              list.map((c: { code: string; name: string }) => ({
                id: c.code,
                name: c.name,
              })),
            );
            setDistricts([{ id: "default", name: "Toàn khu vực" }]);
            setSelectedDistrict("default");
            setSelectedWard("");
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
      setTimeout(() => {
        setDistricts([]);
        setWards([]);
      }, 0);
    }
  }, [selectedProvince]);

  // Clean names to match provinces and wards correctly
  const cleanName = (name: string) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(
        /^(thanh\s+pho|tinh|quan|huyen|phuong|xa|thi\s+tran|thi\s+xa)\s+/g,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
  };

  // Sync selected saved address's province and ward IDs
  useEffect(() => {
    console.log("Sync Effect triggered", {
      addressMode,
      selectedSavedAddressId,
      hasCustomer: !!customer,
      addressesCount: customer?.addresses?.length,
      provincesCount: provinces.length,
      wardsCount: wards.length,
    });
    if (
      addressMode === "saved" &&
      selectedSavedAddressId &&
      customer?.addresses
    ) {
      const selectedAddr = customer.addresses.find(
        (addr) => addr.id === selectedSavedAddressId,
      );
      console.log("Selected Address found:", selectedAddr);
      if (selectedAddr) {
        const metadata = selectedAddr.metadata || {};
        console.log("Address Metadata:", metadata);
        if (metadata.province_id && metadata.ward_id) {
          console.log(
            "Using metadata IDs directly:",
            metadata.province_id,
            metadata.ward_id,
          );
          // If metadata exists, use it directly
          if (selectedProvince !== metadata.province_id) {
            setSelectedProvince(metadata.province_id);
          }
          if (selectedDistrict !== (metadata.district_id || "default")) {
            setSelectedDistrict(metadata.district_id || "default");
          }
          if (selectedWard !== metadata.ward_id) {
            setSelectedWard(metadata.ward_id);
          }
        } else {
          console.log("No metadata IDs found. Cleaning names:", {
            provinceName: selectedAddr.province,
            wardName: selectedAddr.address_2,
          });
          // Fallback to name matching
          if (selectedAddr.province && provinces.length > 0) {
            const matchedProv = provinces.find(
              (p) =>
                cleanName(p.name) === cleanName(selectedAddr.province || ""),
            );
            console.log("Matched Province from list:", matchedProv);
            if (matchedProv && selectedProvince !== matchedProv.id) {
              setSelectedProvince(matchedProv.id);
            }
          }
          if (selectedAddr.address_2 && wards.length > 0) {
            const matchedWard = wards.find(
              (w) =>
                cleanName(w.name) === cleanName(selectedAddr.address_2 || ""),
            );
            console.log("Matched Ward from list:", matchedWard);
            if (matchedWard && selectedWard !== matchedWard.id) {
              setSelectedWard(matchedWard.id);
              setSelectedDistrict("default");
            }
          }
        }
      }
    }
  }, [
    addressMode,
    selectedSavedAddressId,
    customer?.addresses,
    provinces,
    wards,
    selectedProvince,
    selectedWard,
    selectedDistrict,
  ]);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Validate email & phone if guest checkout
    if (isGuestCheckout && !isLoggedIn) {
      if (
        !fullName.trim() ||
        !validateEmail(email) ||
        !validatePhone(phoneNumber)
      ) {
        setAddressValidationError(
          "Vui lòng điền đầy đủ và chính xác thông tin cá nhân (Họ tên, Email và Số điện thoại hợp lệ).",
        );
        setIsProcessing(false);
        return;
      }
    }

    // Validate address if mode is 'new'
    if (addressMode === "new") {
      if (!selectedProvince || !selectedWard || !detailAddress.trim()) {
        setAddressValidationError(
          "Vui lòng chọn hoặc nhập đầy đủ thông tin Tỉnh/Thành, Phường/Xã và Địa chỉ chi tiết.",
        );
        setIsProcessing(false);
        return;
      }
    }
    setAddressValidationError("");

    // Save address if logged in, new address, and setAsDefault is checked
    if (isLoggedIn && addressMode === "new" && setAsDefault) {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      const addressPayload = {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        address_1: detailAddress,
        address_2: wardName,
        city: districtName,
        province: provinceName,
        postal_code: "100000",
        country_code: "vn",
        company: "Địa chỉ mới",
        is_default_shipping: true,
        metadata: {
          province_id: selectedProvince,
          district_id: resolvedGhnDistrictId
            ? resolvedGhnDistrictId.toString()
            : selectedDistrict,
          ward_id: selectedWard,
          ward_code: resolvedGhnWardCode || selectedWard,
        },
      };

      try {
        await authService.authFetch(
          `${MEDUSA_BACKEND_URL}/store/customers/me/addresses`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addressPayload),
          },
        );
      } catch (err) {
        console.error("Error saving new address:", err);
      }
    }

    const calculatedTotal = Math.max(0, subtotal + shippingFee - promoDiscount);

    if (paymentMethod === 'wallet' && walletBalance < calculatedTotal) {
      showToast('Số dư ví không đủ để thanh toán đơn hàng này.', 'error');
      setIsProcessing(false);
      return;
    }

    const orderData = {
      customer: {
        fullName: finalOrderFullName,
        phoneNumber: finalOrderPhone,
        email: isLoggedIn ? customer?.email || email : email,
      },
      paymentMethod:
        useWallet && walletBalance >= calculatedTotal
          ? "wallet"
          : paymentMethod,
      shippingMethod,
      shippingFee,
      address: finalOrderAddress,
      addressComponents:
        addressMode === "new"
          ? {
              province: provinceName,
              district: districtName,
              ward: wardName,
              detail: detailAddress,
              metadata: {
                province_id: selectedProvince,
                district_id: selectedDistrict,
                ward_code: selectedWard,
              },
            }
          : {
              metadata: savedAddresses.find(
                (a) => a.id === selectedSavedAddressId,
              )?.metadata,
            },
      setAsDefault: addressMode === "new" ? setAsDefault : false,
      note,
      items: cartItems,
      use_wallet: useWallet,
      customer_id: customer?.id || undefined,
      totalAmount: calculatedTotal,
      promo_code: promoCode || undefined,
    };

    console.log("Placing order...", orderData);

    // Save order data for the success page
    const finalPaymentMethod =
      useWallet && walletBalance >= calculatedTotal ? "wallet" : paymentMethod;
    const walletDeductedVal =
      useWallet && walletBalance > 0
        ? walletBalance >= calculatedTotal
          ? calculatedTotal
          : walletBalance
        : 0;

    localStorage.setItem(
      "latest_order",
      JSON.stringify({
        ...orderData,
        id: `#SF${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        subtotal,
        shippingFee,
        discount: walletDeductedVal + promoDiscount,
        total: calculatedTotal - walletDeductedVal,
        paymentMethod: finalPaymentMethod,
      }),
    );

    try {
      const response = await authService.authFetch(
        `${MEDUSA_BACKEND_URL}/store/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Thanh toán thất bại", "error");
        setIsProcessing(false);
        return;
      }

      // Save orderId + items to localStorage for potential cancellation rollback
      if (data.orderId) {
        const orderRecord = {
          orderId: data.orderId,
          items: cartItems.map((i) => ({
            id: i.id,
            qty: i.qty,
            name: i.name,
            price: i.price,
            img: i.img,
            variant: i.variant,
          })),
          customer: orderData.customer,
          address: orderData.address,
          paymentMethod: orderData.paymentMethod,
          shippingMethod: orderData.shippingMethod,
          shippingFee: shippingFee,
          created_at: Date.now(),
        };
        // Keep last 10 orders in history
        const history: any[] = JSON.parse(
          localStorage.getItem("sprylo_orders") || "[]",
        );
        history.unshift(orderRecord);
        localStorage.setItem(
          "sprylo_orders",
          JSON.stringify(history.slice(0, 10)),
        );
        // Save as the last order for the OrderSuccessPage to display dynamically
        localStorage.setItem("sprylo_last_order", JSON.stringify(orderRecord));
      }

      localStorage.removeItem("applied_promo_code");
      localStorage.removeItem("applied_promo_discount");
      setIsProcessing(false);
      if (!buyNowItem) {
        clearCart();
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      showToast("Đã có lỗi xảy ra trong quá trình xử lý đơn hàng.", "error");
      setIsProcessing(false);
      return;
    }

    setTimeout(() => {
      navigate("/order-success");
    }, 2000);
  };

  // Calculate dynamic package properties based on cart items
  const totalWeight = cartItems.reduce(
    (acc, item) => acc + (item.weight || 250) * item.qty,
    0,
  );
  const totalHeight = cartItems.reduce(
    (acc, item) => acc + (item.height || 5) * item.qty,
    0,
  );
  const maxLength =
    cartItems.length > 0
      ? Math.max(...cartItems.map((item) => item.length || 10))
      : 10;
  const maxWidth =
    cartItems.length > 0
      ? Math.max(...cartItems.map((item) => item.width || 10))
      : 10;
  const insuranceValue = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const [ghnExpressFee, setGhnExpressFee] = useState(35000);
  const [ghnEconomyFee, setGhnEconomyFee] = useState(25000);
  const [ghtkFee, setGhtkFee] = useState(30000);
  // Determine shipping fee based on selected method
  const shippingFee =
    shippingMethod === "ghn"
      ? ghnExpressFee
      : shippingMethod === "ghtk"
        ? ghtkFee
        : ghnEconomyFee;
  const [resolvedGhnDistrictId, setResolvedGhnDistrictId] = useState<
    number | null
  >(null);
  const [resolvedGhnWardCode, setResolvedGhnWardCode] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Call Shipping Fee API when district/ward changes
    if (selectedDistrict && selectedWard) {
      let provinceName = "";
      let districtName = "";
      let wardName = "";

      if (
        addressMode === "saved" &&
        selectedSavedAddressId &&
        customer?.addresses
      ) {
        const selectedAddr = customer.addresses.find(
          (addr) => addr.id === selectedSavedAddressId,
        );
        if (selectedAddr) {
          provinceName = selectedAddr.province || "";
          wardName = selectedAddr.address_2 || "";
          // We don't have a strict districtName field in Medusa Address by default,
          // but we map selectedDistrict ID to name for GHN anyway.
          // Let's rely on the districts array which should be populated if editing/using existing.
          const districtObj = districts.find(
            (d) =>
              String(d.id) === String(selectedAddr.city || selectedDistrict),
          );
          districtName = districtObj ? districtObj.name : "";
        }
      } else {
        const provinceObj = provinces.find((p) => p.id === selectedProvince);
        provinceName = provinceObj ? provinceObj.name : "";
        const districtObj = districts.find(
          (d) => String(d.id) === String(selectedDistrict),
        );
        districtName = districtObj ? districtObj.name : "";
        const wardObj = wards.find((w) => w.id === selectedWard);
        wardName = wardObj ? wardObj.name : "";
      }

      console.log("Fetching shipping fee for names/IDs:", {
        selectedProvince,
        selectedDistrict,
        selectedWard,
        provinceName,
        districtName,
        wardName,
      });

      const fetchFee = (serviceTypeId: number) => {
        return fetch(`${MEDUSA_BACKEND_URL}/store/ghn/fee`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            from_district_id: 1442,
            from_ward_code: "21211",
            service_type_id: serviceTypeId,
            to_district_id: parseInt(selectedDistrict) || 1442,
            to_ward_code: selectedWard || "21211",
            province_name: provinceName,
            ward_name: wardName,
            height: totalHeight || 10,
            length: maxLength || 10,
            weight: totalWeight || 200,
            width: maxWidth || 10,
            insurance_value:
              insuranceValue > 5000000 ? 5000000 : insuranceValue, // GHN insurance limit
            cod_failed_amount: 2000,
            coupon: null,
          }),
        }).then((res) => res.json());
      };

      const fetchGhtkFee = () => {
        return fetch(`${MEDUSA_BACKEND_URL}/store/ghtk/fee`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            province_name: provinceName,
            district_name: districtName,
            ward_name: wardName,
            weight: totalWeight || 200,
            height: totalHeight || 10,
            length: maxLength || 10,
            width: maxWidth || 10,
            insurance_value:
              insuranceValue > 5000000 ? 5000000 : insuranceValue,
          }),
        }).then((res) => res.json());
      };

      Promise.all([fetchFee(2), fetchFee(5), fetchGhtkFee()])
        .then(([expressData, economyData, ghtkData]) => {
          if (expressData.data?.total) {
            setGhnExpressFee(expressData.data.total);
            if (
              expressData.data.resolved_district_id &&
              expressData.data.resolved_ward_code
            ) {
              setResolvedGhnDistrictId(expressData.data.resolved_district_id);
              setResolvedGhnWardCode(expressData.data.resolved_ward_code);
            }
          } else {
            setGhnExpressFee(0);
          }

          if (economyData.data?.total) {
            setGhnEconomyFee(economyData.data.total);
          } else {
            setGhnEconomyFee(0);
          }

          if (ghtkData?.fee?.fee) {
            setGhtkFee(ghtkData.fee.fee);
          } else {
            console.warn(
              "Could not get GHTK fee, falling back to default",
              ghtkData,
            );
            setGhtkFee(30000);
          }
        })
        .catch((error) => {
          console.error("Fee API error:", error);
          setGhnExpressFee(0);
          setGhnEconomyFee(0);
        });
    } else {
      console.log("Skipping shipping fee fetch - missing IDs:", {
        selectedDistrict,
        selectedWard,
      });
      // Default initial prices before location is selected
      setTimeout(() => {
        setGhnExpressFee(0);
        setGhnEconomyFee(0);
      }, 0);
    }
  }, [
    selectedDistrict,
    selectedWard,
    totalHeight,
    maxLength,
    totalWeight,
    maxWidth,
    insuranceValue,
    addressMode,
    selectedSavedAddressId,
    customer,
    provinces,
    wards,
    selectedProvince,
  ]);

  const total = Math.max(0, subtotal + shippingFee - promoDiscount);
  const walletDeduction = paymentMethod === 'wallet' ? Math.min(walletBalance, total) : 0;
  const remainingTotal = total - walletDeduction;

  if (cartItems.length === 0) {
    return (
      <div
        className="checkout-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(15,23,42,0.1)",
          }}
        >
          <ShoppingBag
            size={64}
            color="#cbd5e1"
            style={{ margin: "0 auto 20px" }}
          />
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "10px",
            }}
          >
            Giỏ hàng đang trống
          </h2>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng để thanh toán.
          </p>
          <Link
            to="/cart"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={20} />
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-container">
          <nav className="checkout-nav-content">
            <Link to="/" className="checkout-logo">
              <ShoppingBag size={28} />
              <span>Sprylo</span>
            </Link>

            <div className="checkout-steps">
              <div className="step-item active">
                <span className="step-number">1</span>
                <span>Thông tin</span>
                <ChevronRight size={16} />
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span>Thanh toán</span>
                <ChevronRight size={16} />
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span>Hoàn tất</span>
              </div>
            </div>
            <Link to="/cart" className="checkout-text-soft">
              <Lock size={20} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="checkout-container">
        <div className="checkout-grid">
          {/* LEFT: INFORMATION FORM */}
          <div className="checkout-main">
            {isLoadingProfile ? (
              <div
                className="auth-gate-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                }}
              >
                <Loader2
                  size={40}
                  className="spinner"
                  style={{
                    color: "var(--checkout-accent)",
                    marginBottom: "1rem",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p
                  style={{
                    color: "var(--checkout-text-soft)",
                    fontWeight: 500,
                  }}
                >
                  Đang kiểm tra thông tin tài khoản...
                </p>
              </div>
            ) : !isLoggedIn && !isGuestCheckout ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-gate-card"
              >
                <div className="auth-gate-header">
                  <h3>Xác thực thông tin</h3>
                  <p>
                    Đăng nhập thành viên để sử dụng địa chỉ giao hàng đã lưu,
                    thanh toán qua ví và tích luỹ điểm thưởng.
                  </p>
                </div>

                <div className="auth-gate-tabs">
                  <button
                    className={`auth-gate-tab ${authTab === "login" ? "active" : ""}`}
                    onClick={() => {
                      setAuthTab("login");
                      setLoginError("");
                    }}
                  >
                    <LogIn size={16} /> Đăng nhập
                  </button>
                  <button
                    className={`auth-gate-tab ${authTab === "register" ? "active" : ""}`}
                    onClick={() => {
                      setAuthTab("register");
                      setRegError("");
                    }}
                  >
                    <UserPlus size={16} /> Đăng ký
                  </button>
                  <button
                    className={`auth-gate-tab ${authTab === "guest" ? "active" : ""}`}
                    onClick={() => setAuthTab("guest")}
                  >
                    <ShieldCheck size={16} /> Mua dạng khách
                  </button>
                </div>

                <div className="auth-gate-content">
                  {authTab === "login" && (
                    <form onSubmit={handleInlineLogin} noValidate>
                      {loginError && (
                        <div className="auth-error-banner">
                          <AlertCircle size={16} />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="email@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mật khẩu *</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Nhập mật khẩu"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <>
                            <Loader2
                              size={18}
                              className="spinner"
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                            Đang xác thực...
                          </>
                        ) : (
                          "ĐĂNG NHẬP & TIẾP TỤC"
                        )}
                      </button>

                      <div className="auth-divider">hoặc đăng nhập với</div>

                      <div className="auth-social-row">
                        <button
                          type="button"
                          className="auth-social-btn"
                          onClick={() => handleSocialLogin("google")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </button>
                        <button
                          type="button"
                          className="auth-social-btn"
                          onClick={() => handleSocialLogin("facebook")}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="#1877F2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </button>
                      </div>

                      <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
                        <Link
                          to="/login?redirect=/checkout"
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--checkout-accent)",
                            fontWeight: 600,
                            textDecoration: "underline",
                          }}
                        >
                          Mở trang Đăng nhập đầy đủ →
                        </Link>
                      </div>
                    </form>
                  )}

                  {authTab === "register" && (
                    <form onSubmit={handleInlineRegister} noValidate>
                      {regError && (
                        <div className="auth-error-banner">
                          <AlertCircle size={16} />
                          <span>{regError}</span>
                        </div>
                      )}

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Họ *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nguyễn"
                            value={regLastName}
                            onChange={(e) => setRegLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tên *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Văn A"
                            value={regFirstName}
                            onChange={(e) => setRegFirstName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="email@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Số điện thoại *</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="09xxxxxxxx"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Mật khẩu *</label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Tối thiểu 8 ký tự"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Xác nhận mật khẩu *
                          </label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Nhập lại mật khẩu"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={regLoading}
                      >
                        {regLoading ? (
                          <>
                            <Loader2
                              size={18}
                              className="spinner"
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                            Đang tạo tài khoản...
                          </>
                        ) : (
                          "ĐĂNG KÝ & TIẾP TỤC"
                        )}
                      </button>
                    </form>
                  )}

                  {authTab === "guest" && (
                    <div className="guest-gate-box">
                      <div className="guest-info-desc">
                        <ShieldCheck
                          size={32}
                          style={{
                            color: "var(--checkout-accent)",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <h4>Thanh toán không cần tài khoản</h4>
                        <p>
                          Bạn có thể hoàn tất mua sắm nhanh chóng mà không cần
                          đăng ký. Chúng tôi chỉ sử dụng thông tin của bạn để xử
                          lý giao hàng và gửi hóa đơn điện tử.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="guest-bypass-btn"
                        onClick={() => {
                          setIsGuestCheckout(true);
                          setAddressMode("new");
                        }}
                      >
                        TIẾP TỤC DƯỚI VAI TRÒ KHÁCH <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                {isLoggedIn && customer && (
                  <div className="auth-status-bar">
                    <div className="auth-status-info">
                      <User size={16} />
                      <span>
                        Thành viên: <strong>{customer.email}</strong> (
                        {customer.first_name} {customer.last_name})
                      </span>
                    </div>
                    <button
                      className="auth-status-logout"
                      onClick={() => {
                        authService.logout();
                        setIsLoggedIn(false);
                        setIsGuestCheckout(false);
                        setFullName("");
                        setPhoneNumber("");
                        setEmail("");
                        setSavedAddresses([]);
                        setAddressMode("new");
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="checkout-section"
                >
                  <h2 className="section-title">
                    <User size={22} /> Thông tin khách hàng
                  </h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Họ và tên *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoggedIn && addressMode === "saved"}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="09xx xxx xxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoggedIn && addressMode === "saved"}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (nhận vận đơn) *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoggedIn}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="checkout-section"
                >
                  <h2 className="section-title">
                    <MapPin size={22} /> Địa chỉ nhận hàng
                  </h2>

                  {isLoggedIn && savedAddresses.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                        borderBottom: "1px solid var(--checkout-border)",
                      }}
                    >
                      <button
                        style={{
                          padding: "0.8rem 1rem",
                          background: "none",
                          border: "none",
                          borderBottom:
                            addressMode === "saved"
                              ? "2px solid var(--checkout-accent)"
                              : "2px solid transparent",
                          color:
                            addressMode === "saved"
                              ? "var(--checkout-accent)"
                              : "var(--checkout-text-soft)",
                          fontWeight: addressMode === "saved" ? 700 : 500,
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                        onClick={() => setAddressMode("saved")}
                      >
                        Địa chỉ đã lưu
                      </button>
                      <button
                        style={{
                          padding: "0.8rem 1rem",
                          background: "none",
                          border: "none",
                          borderBottom:
                            addressMode === "new"
                              ? "2px solid var(--checkout-accent)"
                              : "2px solid transparent",
                          color:
                            addressMode === "new"
                              ? "var(--checkout-accent)"
                              : "var(--checkout-text-soft)",
                          fontWeight: addressMode === "new" ? 700 : 500,
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                        onClick={() => setAddressMode("new")}
                      >
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  )}

                  {isLoggedIn &&
                  addressMode === "saved" &&
                  savedAddresses.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedSavedAddressId(addr.id)}
                          style={{
                            padding: "1.2rem",
                            border:
                              selectedSavedAddressId === addr.id
                                ? "2px solid var(--checkout-accent)"
                                : "1px solid var(--checkout-border)",
                            borderRadius: "var(--checkout-radius)",
                            cursor: "pointer",
                            background:
                              selectedSavedAddressId === addr.id
                                ? "var(--checkout-accent-soft)"
                                : "white",
                            position: "relative",
                          }}
                        >
                          {addr.isDefault && (
                            <span
                              style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                background: "#10b981",
                                color: "white",
                                fontSize: "0.7rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "4px",
                                fontWeight: 600,
                              }}
                            >
                              Mặc định
                            </span>
                          )}
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: "0.4rem",
                              color: "var(--checkout-text)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {selectedSavedAddressId === addr.id ? (
                              <CheckCircle2
                                size={16}
                                color="var(--checkout-accent)"
                              />
                            ) : (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  border: "1px solid var(--checkout-border)",
                                  borderRadius: "50%",
                                }}
                              ></div>
                            )}
                            {addr.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--checkout-text-soft)",
                              paddingLeft: "24px",
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {addr.fullName}
                            </span>{" "}
                            | {addr.phone}
                            <br />
                            {addr.mergedAddress}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Tỉnh / Thành phố *</label>
                        <select
                          className="form-select"
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Phường / Xã *</label>
                          <select
                            className="form-select"
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedProvince}
                          >
                            <option value="">Chọn phường/xã</option>
                            {wards.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Địa chỉ chi tiết *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Số nhà, tên đường..."
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                          />
                        </div>
                      </div>

                      {mergedAddress && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="merged-address-preview"
                        >
                          <div className="preview-label">Địa chỉ tổng hợp:</div>
                          <div className="preview-content">{mergedAddress}</div>
                        </motion.div>
                      )}

                      {isLoggedIn && (
                        <div
                          className="form-group"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            marginTop: "1rem",
                          }}
                        >
                          <input
                            type="checkbox"
                            id="setDefault"
                            checked={setAsDefault}
                            onChange={(e) => setSetAsDefault(e.target.checked)}
                            style={{
                              cursor: "pointer",
                              width: "16px",
                              height: "16px",
                              accentColor: "var(--checkout-accent)",
                            }}
                          />
                          <label
                            htmlFor="setDefault"
                            style={{
                              cursor: "pointer",
                              margin: 0,
                              userSelect: "none",
                              fontWeight: 500,
                            }}
                          >
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>
                      )}
                    </>
                  )}

                  <div
                    className="form-group mb-0"
                    style={{ marginTop: "1.25rem" }}
                  >
                    <label className="form-label">Ghi chú (tùy chọn)</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Giao giờ hành chính, gọi trước khi đến..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                  </div>
                </motion.div>

                {isLoggedIn && walletBalance > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="checkout-section wallet-section"
                    style={{
                      border: "1px solid #c7d2fe",
                      background:
                        "linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            background: "var(--checkout-accent)",
                            color: "white",
                            padding: "10px",
                            borderRadius: "10px",
                          }}
                        >
                          <Wallet size={20} />
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "var(--checkout-text)",
                            }}
                          >
                            Sử dụng Ví Sprylo
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.85rem",
                              color: "var(--checkout-text-soft)",
                            }}
                          >
                            Số dư hiện tại:{" "}
                            <strong style={{ color: "var(--checkout-accent)" }}>
                              {walletBalance.toLocaleString("vi-VN")}đ
                            </strong>
                          </p>
                        </div>
                      </div>
                      <div
                        className={`custom-toggle ${useWallet ? "active" : ""}`}
                        onClick={() => setUseWallet(!useWallet)}
                      >
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="checkout-section"
                >
                  <h2 className="section-title">
                    <Truck size={22} /> Đơn vị vận chuyển
                  </h2>
                  <div className="option-grid">
                    <div
                      className={`option-card ${shippingMethod === "ghn" ? "selected" : ""}`}
                      onClick={() => setShippingMethod("ghn")}
                    >
                      <div className="option-card-header">
                        <span className="option-name">
                          Giao hàng Nhanh (Express)
                        </span>
                        <span className="option-price">
                          {ghnExpressFee > 0
                            ? `${ghnExpressFee.toLocaleString("vi-VN")}đ`
                            : "Chưa tính"}
                        </span>
                      </div>
                      <span className="option-desc">
                        Giao tốc hành 1-2 ngày
                      </span>
                      {shippingMethod === "ghn" && (
                        <div className="check-badge">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`option-card ${shippingMethod === "ghtk" ? "selected" : ""}`}
                      onClick={() => setShippingMethod("ghtk")}
                    >
                      <div className="option-card-header">
                        <span className="option-name">
                          Giao hàng Tiết kiệm (Economy)
                        </span>
                        <span className="option-price">
                          {ghtkFee > 0
                            ? `${ghtkFee.toLocaleString("vi-VN")}đ`
                            : "Chưa tính"}
                        </span>
                      </div>
                      <span className="option-desc">
                        Giao tiêu chuẩn 3-4 ngày
                      </span>
                      {shippingMethod === "ghtk" && (
                        <div className="check-badge">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="checkout-section"
                  style={{
                    opacity:
                      useWallet && walletBalance >= subtotal + shippingFee
                        ? 0.5
                        : 1,
                    pointerEvents:
                      useWallet && walletBalance >= subtotal + shippingFee
                        ? "none"
                        : "auto",
                  }}
                >
                  <h2 className="section-title">
                    <CreditCard size={22} /> Phương thức thanh toán
                  </h2>
                  <div className="option-grid">
                    <div
                      className={`option-card ${paymentMethod === "vnpay" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("vnpay")}
                    >
                      <div className="option-card-header">
                        <span className="option-name">VNPay</span>
                      </div>
                      <span className="option-desc">Thẻ ATM/QR Code/Visa</span>
                      {paymentMethod === "vnpay" && (
                        <div className="check-badge">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`option-card ${paymentMethod === "zalopay" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("zalopay")}
                    >
                      <div className="option-card-header">
                        <span className="option-name">ZaloPay</span>
                      </div>
                      <span className="option-desc">Ví ZaloPay tiện lợi</span>
                      {paymentMethod === "zalopay" && (
                        <div className="check-badge">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`option-card ${paymentMethod === "cod" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="option-card-header">
                        <span className="option-name">COD</span>
                      </div>
                      <span className="option-desc">
                        Thanh toán khi nhận hàng
                      </span>
                      {paymentMethod === "cod" && (
                        <div className="check-badge">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div 
                      className={`option-card ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <div className="option-card-header">
                        <span className="option-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wallet size={16} /> Ví Sprylo
                        </span>
                      </div>
                      <span className="option-desc">
                        {isLoggedIn ? `Số dư: ${walletBalance.toLocaleString('vi-VN')}đ` : 'Cần đăng nhập'}
                      </span>
                      {paymentMethod === 'wallet' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="checkout-sidebar">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="summary-card"
            >
              <h3 className="summary-title">Đơn hàng của bạn</h3>

              <div className="item-list">
                {cartItems.map((item) => {
                  const imgUrl = item.img.startsWith("http")
                    ? item.img
                    : `https://images.unsplash.com/${item.img}?w=200&q=80&auto=format&fit=crop`;
                  return (
                    <div key={item.id} className="summary-item">
                      <img src={imgUrl} alt={item.name} className="item-img" />
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">
                          {item.qty} x {item.price.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                {shippingFee > 0 ? (
                  <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                ) : (
                  <span style={{ color: "#a5f3fc", fontWeight: 600 }}>
                    Chưa tính
                  </span>
                )}
              </div>

              {useWallet && walletDeduction > 0 && (
                <div
                  className="summary-row"
                  style={{ color: "#a5f3fc", fontWeight: 600 }}
                >
                  <span>Khấu trừ từ Ví Sprylo</span>
                  <span>-{walletDeduction.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div
                  className="summary-row"
                  style={{ color: "#a5f3fc", fontWeight: 600 }}
                >
                  <span>Khuyến mãi {promoCode ? `(${promoCode})` : ""}</span>
                  <span>-{promoDiscount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>{remainingTotal.toLocaleString("vi-VN")}đ</span>
              </div>

              {remainingTotal === 0 && useWallet && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "10px",
                    fontSize: "0.85rem",
                    color: "#a5f3fc",
                    fontWeight: 700,
                  }}
                >
                  🎉 Thanh toán toàn bộ bằng Ví Sprylo!
                </div>
              )}

              {validationErrors.length > 0 && (
                <div
                  style={{
                    padding: "12px",
                    background: "#fef2f2",
                    borderLeft: "4px solid #ef4444",
                    borderRadius: "6px",
                    color: "#991b1b",
                    fontSize: "0.85rem",
                    marginBottom: "15px",
                  }}
                >
                  <strong>⚠️ Lỗi tồn kho:</strong>
                  <ul
                    style={{
                      paddingLeft: "15px",
                      marginTop: "5px",
                      listStyleType: "disc",
                    }}
                  >
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {addressValidationError && (
                <div
                  style={{
                    padding: "12px",
                    background: "#fffbeb",
                    borderLeft: "4px solid #f59e0b",
                    borderRadius: "6px",
                    color: "#b45309",
                    fontSize: "0.85rem",
                    marginBottom: "15px",
                  }}
                >
                  <strong>⚠️ Lỗi thông tin:</strong>
                  <p style={{ marginTop: "5px" }}>{addressValidationError}</p>
                </div>
              )}

              <button
                className="btn-checkout"
                onClick={handlePlaceOrder}
                disabled={validationErrors.length > 0 || isProcessing}
                style={{
                  background: validationErrors.length > 0 ? "#ef4444" : "",
                  borderColor: validationErrors.length > 0 ? "#ef4444" : "",
                  cursor:
                    validationErrors.length > 0 || isProcessing
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {validationErrors.length > 0
                  ? "LỖI TỒN KHO - KHÔNG THỂ THANH TOÁN"
                  : isProcessing
                    ? "ĐANG XỬ LÝ ĐƠN HÀNG..."
                    : "HOÀN THÀNH ĐẶT HÀNG"}
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>

              <div className="trust-badges">
                <div className="trust-badge">
                  <ShieldCheck size={20} />
                  <span>Bảo mật</span>
                </div>
                <div className="trust-badge">
                  <Truck size={20} />
                  <span>Giao nhanh</span>
                </div>
                <div className="trust-badge">
                  <CheckCircle2 size={20} />
                  <span>Chính hãng</span>
                </div>
              </div>
            </motion.div>

            <div className="mt-4" style={{ textAlign: "center" }}>
              <Link
                to="/cart"
                className="checkout-text-soft"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <ChevronLeft size={16} /> Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
