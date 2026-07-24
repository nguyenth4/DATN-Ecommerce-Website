import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/account.css';
import '../styles/order-tracking.css';
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
  Shield
} from 'lucide-react';
import { useProducts } from '../services/product.service';
import { walletService } from '../services/wallet.service';
import { authService } from '../services/auth.service';
import { getWishlist } from '../utils/wishlist';
import ProductCard from '../components/ProductCard';

const MEDUSA_BACKEND_URL = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

// Mock Orders Data
const MOCK_ORDERS = [
  {
    id: 'SF2025-8843',
    date: '24/05/2025 – 09:32',
    total: 38015000,
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'Thẻ tín dụng (Visa/Mastercard)',
    shippingStatus: 'Đang giao',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Sony WH-1000XM5',
        variant: 'Đen',
        quantity: 1,
        price: 8490000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'
      },
      {
        name: 'iPhone 15 Pro Max 256GB',
        variant: 'Titan Tự Nhiên',
        quantity: 1,
        price: 29525000,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&q=80'
      }
    ],
    timeline: [
      { time: '25/05/2025 – 10:45', desc: 'Đang trên đường giao hàng', sub: 'Nhân viên: Nguyễn Văn Tài – 0901 234 567', current: true },
      { time: '25/05/2025 – 08:20', desc: 'Đã rời kho phân phối – TP.HCM', sub: 'Bưu cục: GHN Quận 1', done: true },
      { time: '24/05/2025 – 14:30', desc: 'Đang đóng gói hàng hóa', sub: 'Nhân viên kho: Lê Văn B', done: true },
      { time: '24/05/2025 – 10:15', desc: 'Đơn hàng đã được xác nhận', sub: 'Thanh toán trực tuyến thành công', done: true },
      { time: '24/05/2025 – 09:32', desc: 'Đặt hàng thành công', sub: 'Mã giao dịch: #TXN-778932', done: true }
    ],
    statusStep: 3 // Ordered: 0, Confirmed: 1, Packing: 2, Shipping: 3, Delivered: 4
  },
  {
    id: 'SF2025-4421',
    date: '18/04/2025 – 14:15',
    total: 3490000,
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'Ví MoMo',
    shippingStatus: 'Đã nhận',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Bàn phím cơ Keychron K8 Pro',
        variant: 'RGB Red Switch',
        quantity: 1,
        price: 3490000,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&q=80'
      }
    ],
    timeline: [
      { time: '20/04/2025 – 15:30', desc: 'Đã giao hàng thành công', sub: 'Người nhận: Trần Ngọc', done: true },
      { time: '20/04/2025 – 09:15', desc: 'Đang giao hàng', sub: 'Nhân viên: Nguyễn Văn Tài', done: true },
      { time: '19/04/2025 – 11:20', desc: 'Đã rời kho phân phối', sub: 'Bưu cục: GHN Quận 1', done: true },
      { time: '18/04/2025 – 15:40', desc: 'Đã hoàn tất đóng gói', sub: 'Nhân viên kho', done: true },
      { time: '18/04/2025 – 14:15', desc: 'Đặt hàng thành công', sub: 'Mã giao dịch: #TXN-665243', done: true }
    ],
    statusStep: 4
  },
  {
    id: 'SF2025-1102',
    date: '02/03/2025 – 18:22',
    total: 12500000,
    paymentStatus: 'Chưa thanh toán',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingStatus: 'Đã hủy',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Màn hình Dell UltraSharp U2422H 24" IPS',
        variant: 'Đen',
        quantity: 2,
        price: 6250000,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&q=80'
      }
    ],
    timeline: [
      { time: '03/03/2025 – 10:00', desc: 'Đã hủy đơn hàng', sub: 'Lý do: Khách hàng yêu cầu hủy đơn', done: true }
    ],
    statusStep: -1
  }
];

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'wallet' | 'password' | 'policies'>('profile');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dob, setDob] = useState('1998-05-15');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwFieldErrors, setPwFieldErrors] = useState<{ old?: string; new?: string; confirm?: string }>({});

  // Password strength checker
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Rất yếu', color: 'var(--rose)' };
    if (score === 2) return { score, label: 'Yếu', color: '#f97316' };
    if (score === 3) return { score, label: 'Trung bình', color: '#eab308' };
    if (score === 4) return { score, label: 'Mạnh', color: '#22c55e' };
    return { score, label: 'Rất mạnh', color: '#10b981' };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess(false);
    const fieldErrors: { old?: string; new?: string; confirm?: string } = {};

    if (!oldPassword) fieldErrors.old = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword || newPassword.length < 8) fieldErrors.new = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    if (newPassword === oldPassword) fieldErrors.new = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    if (newPassword !== confirmNewPassword) fieldErrors.confirm = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(fieldErrors).length > 0) {
      setPwFieldErrors(fieldErrors);
      return;
    }
    setPwFieldErrors({});
    setPwLoading(true);

    try {
      // Step 1: Re-authenticate with old password to verify it
      const authRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483',
        },
        body: JSON.stringify({ email, password: oldPassword }),
      });

      if (!authRes.ok) {
        setPwFieldErrors({ old: 'Mật khẩu hiện tại không đúng' });
        setPwLoading(false);
        return;
      }

      const authData = await authRes.json();
      const tempToken = authData?.token;
      if (!tempToken) {
        setPwError('Không thể xác thực. Vui lòng thử lại.');
        setPwLoading(false);
        return;
      }

      // Step 2: Update password using the auth token
      const updateRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (!updateRes.ok) {
        const body = await updateRes.json().catch(() => ({}));
        setPwError(body?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
        setPwLoading(false);
        return;
      }

      // Step 3: Success — clear form
      setPwSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPwSuccess(false), 5000);
    } catch {
      setPwError('Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
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

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrCompany, setAddrCompany] = useState('Nhà riêng');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Fetch profile function
  const fetchProfile = async () => {
    try {
      const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/customers/me?fields=*addresses`);
      if (res.ok) {
        const { customer } = await res.json();
        if (customer) {
          setCustomerId(customer.id);
          setFirstName(customer.first_name || '');
          setLastName(customer.last_name || '');
          setEmail(customer.email || '');
          setPhone(customer.phone || '');
          setGender(customer.metadata?.gender || 'Nam');
          setDob(customer.metadata?.dob || '1998-05-15');
          setAvatarUrl(customer.metadata?.avatar_url || '');
          setAddresses(customer.addresses || []);
          
          // cache user details
          localStorage.setItem('customer_info', JSON.stringify({
            id: customer.id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            avatar_url: customer.metadata?.avatar_url || '',
            gender: customer.metadata?.gender || 'Nam',
            dob: customer.metadata?.dob || '1998-05-15',
          }));
        }
      } else if (res.status === 401) {
        // Handled by authFetch logging out
        navigate('/login', { state: { from: location } });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // Fetch Provinces on mount (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    fetch('/api/cas/address-kit/2025-07-01/provinces')
      .then(res => res.json())
      .then(data => {
        const list = data?.provinces || (Array.isArray(data) ? data : []);
        setProvinces(list.map((p: any) => ({ id: p.code, name: p.name })));
      })
      .catch(err => console.error("Error fetching provinces from AddressKit:", err));
  }, []);

  // Fetch Wards/Communes when Province changes (Cas AddressKit API via proxy - 2025-07-01)
  useEffect(() => {
    if (selectedProvince) {
      fetch(`/api/cas/address-kit/2025-07-01/provinces/${selectedProvince}/communes`)
        .then(res => res.json())
        .then(data => {
          const list = data?.communes || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setWards(list.map((c: any) => ({ id: c.code, name: c.name })));
            setDistricts([{ id: 'default', name: 'Toàn khu vực' }]);
            setSelectedDistrict('default');
          } else {
            setWards([]);
            setDistricts([]);
          }
        })
        .catch(err => {
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
    setAddrFullName('');
    setAddrPhone('');
    setAddrDetail('');
    setAddrCompany('Nhà riêng');
    setAddrIsDefault(addresses.length === 0);
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    setShowAddressModal(true);
  };

  const handleEditClick = async (addr: any) => {
    setEditingAddress(addr);
    setAddrFullName(`${addr.first_name || ''} ${addr.last_name || ''}`.trim());
    setAddrPhone(addr.phone || '');
    setAddrDetail(addr.address_1 || '');
    setAddrCompany(addr.company || 'Nhà riêng');
    setAddrIsDefault(addr.is_default_shipping || false);

    const provinceId = addr.metadata?.province_id || '';
    const wardId = addr.metadata?.ward_id || '';

    setSelectedProvince(provinceId);
    
    if (provinceId) {
      try {
        const wardRes = await fetch(`/api/cas/address-kit/2025-07-01/provinces/${provinceId}/communes`);
        const wardData = await wardRes.json();
        const list = wardData?.communes || (Array.isArray(wardData) ? wardData : []);
        if (list.length > 0) {
          setWards(list.map((c: any) => ({ id: c.code, name: c.name })));
          setDistricts([{ id: 'default', name: 'Toàn khu vực' }]);
          setSelectedDistrict('default');
          setSelectedWard(wardId);
        }
      } catch (err) {
        console.error("Error populating location lists for edit:", err);
      }
    }
    
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!addrFullName.trim() || !addrPhone.trim() || !addrDetail.trim() || !selectedProvince || !selectedDistrict || !selectedWard) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
    const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';
    const wardName = wards.find(w => w.id === selectedWard)?.name || '';

    const nameParts = addrFullName.trim().split(' ');
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    const addressPayload = {
      address: {
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
          ward_id: selectedWard
        }
      }
    };

    try {
      let url = `${MEDUSA_BACKEND_URL}/store/customers/me/addresses`;
      let method = 'POST';

      if (editingAddress) {
        url = `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${editingAddress.id}`;
      }

      const res = await authService.authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressPayload)
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
      const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
        method: 'DELETE'
      });

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
      const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: {
            is_default_shipping: true
          }
        })
      });

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
    if (activeTab === 'wallet') {
      const targetCusId = customerId || 'cus_demo_123';
      walletService.getWallet(targetCusId)
        .then(res => setWalletData(res.wallet))
        .catch(console.error);
    }
  }, [activeTab, customerId]);
  
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());

  // Listen to wishlist updates to sync state
  useEffect(() => {
    const handleUpdate = () => {
      setWishlistIds(getWishlist());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, []);

  // Fetch product data from Medusa/fallback mock data for wishlist items
  const { data: productsData, isLoading: isWishlistLoading } = useProducts(
    wishlistIds.length > 0 ? { id: wishlistIds, limit: 10 } : undefined
  );

  const wishlistProducts = useMemo(() => {
    if (wishlistIds.length === 0 || !productsData?.products) return [];
    return wishlistIds
      .map(id => productsData.products.find((p: any) => p.id === id))
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

        const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/custom/upload-avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            avatar: base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
            
            const cached = localStorage.getItem('customer_info');
            if (cached) {
              const customer = JSON.parse(cached);
              customer.avatar_url = data.avatar_url;
              localStorage.setItem('customer_info', JSON.stringify(customer));
            }
            
            window.dispatchEvent(new Event('customer-auth-change'));
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
      const res = await authService.authFetch(`${MEDUSA_BACKEND_URL}/store/custom/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          email: email,
          gender: gender,
          dob: dob
        })
      });
      if (res.ok) {
        const { customer } = await res.json();
        setSaveSuccess(true);
        localStorage.setItem('customer_info', JSON.stringify({
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          avatar_url: customer.metadata?.avatar_url || '',
          gender: customer.metadata?.gender || 'Nam',
          dob: customer.metadata?.dob || '1998-05-15',
        }));
        window.dispatchEvent(new Event('customer-auth-change'));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body?.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleCancelProfile = () => {
    const cached = localStorage.getItem('customer_info');
    if (cached) {
      const customer = JSON.parse(cached);
      setFirstName(customer.first_name || '');
      setLastName(customer.last_name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setGender(customer.gender || 'Nam');
      setDob(customer.dob || '1998-05-15');
      setAvatarUrl(customer.avatar_url || '');
    }
  };

  const selectedOrder = MOCK_ORDERS.find(o => o.id === selectedOrderId);

  const getShippingBadgeClass = (status: string) => {
    switch (status) {
      case 'Đang giao': return 'status-badge badge-shipped';
      case 'Đã nhận': return 'status-badge badge-completed';
      case 'Đã hủy': return 'status-badge badge-cancelled';
      default: return 'status-badge badge-pending';
    }
  };

  const getShippingBadgeIcon = (status: string) => {
    switch (status) {
      case 'Đang giao': return 'bi bi-truck';
      case 'Đã nhận': return 'bi bi-check-circle-fill';
      case 'Đã hủy': return 'bi bi-x-circle-fill';
      default: return 'bi bi-clock-history';
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span><span>Tài khoản</span>
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
                  style={{ display: 'none' }} 
                  accept="image/*" 
                />
                <div className="avatar-wrap" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                  <div className="avatar-img" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uploading ? (
                      <div className="avatar-spinner" style={{ animation: 'spin 1s linear infinite', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', width: '24px', height: '24px' }}></div>
                    ) : avatarUrl ? (
                      <img 
                        src={avatarUrl.startsWith('/') ? `${avatarUrl}` : avatarUrl} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      (firstName || lastName) ? (
                        `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`
                      ) : (
                        <User size={28} />
                      )
                    )}
                  </div>
                  <div className="avatar-edit"><Camera size={14} /></div>
                </div>
                <div className="account-name">{firstName} {lastName}</div>
                <div className="account-email">{email}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div 
                  className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
                >
                  <User size={18} style={{marginRight: '12px'}}/> Thông tin cá nhân
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
                >
                  <Receipt size={18} style={{marginRight: '12px'}}/> Đơn hàng của tôi
                  <span className="badge-count" style={{ marginLeft: 'auto', position: 'static', background: 'var(--indigo)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>
                    {MOCK_ORDERS.length}
                  </span>
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('addresses'); setSelectedOrderId(null); }}
                >
                  <MapPin size={18} style={{marginRight: '12px'}}/> Địa chỉ giao hàng
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('wishlist'); setSelectedOrderId(null); }}
                >
                  <Heart size={18} style={{marginRight: '12px'}}/> Sản phẩm yêu thích
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('wallet'); setSelectedOrderId(null); }}
                >
                  <Wallet size={18} style={{marginRight: '12px'}}/> Ví điện tử Sprylo
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('password'); setSelectedOrderId(null); }}
                >
                  <Lock size={18} style={{marginRight: '12px'}}/> Đổi mật khẩu
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'policies' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('policies'); setSelectedOrderId(null); }}
                >
                  <CheckCircle size={18} style={{marginRight: '12px'}}/> Quản lý chính sách (Seller)
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
                  <LogOut size={18} style={{marginRight: '12px'}}/> Đăng xuất
                </Link>
              </div>
            </div>


            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Thông tin cá nhân
                    </div>
                    
                    {saveSuccess && (
                      <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                        <CheckCircle size={16} /> Cập nhật thông tin cá nhân thành công!
                      </div>
                    )}
                    
                    <div className="alert alert-info" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} /> Tài khoản đã xác thực email
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Họ *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tên *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
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
                    <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.8rem' }}>
                      <button className="btn btn--ghost" onClick={handleCancelProfile}>Hủy thay đổi</button>
                      <button className="btn btn--indigo" onClick={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="tab-panel active">
                  {!selectedOrderId ? (
                    // Orders List View
                    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                        Đơn hàng của tôi
                      </div>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Mã đơn hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng cộng</th>
                              <th>Thanh toán</th>
                              <th>Vận chuyển</th>
                              <th style={{ textAlign: 'right' }}>Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MOCK_ORDERS.map((order) => (
                              <tr key={order.id}>
                                <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{order.id}</td>
                                <td>{order.date.split(' – ')[0]}</td>
                                <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>{formatPrice(order.total)}</td>
                                <td>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{order.paymentStatus}</span>
                                </td>
                                <td>
                                  <span className={getShippingBadgeClass(order.shippingStatus)}>
                                    <i className={getShippingBadgeIcon(order.shippingStatus)}></i> {order.shippingStatus}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button 
                                    className="btn btn--sm btn--indigo" 
                                    onClick={() => setSelectedOrderId(order.id)}
                                  >
                                    Chi tiết
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
                        <button className="btn-back" onClick={() => setSelectedOrderId(null)}>
                          <i className="bi bi-arrow-left"></i> Trở lại danh sách đơn hàng
                        </button>
                        
                        <div className="order-details-header">
                          <div>
                            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                              Chi tiết đơn hàng {selectedOrder.id}
                            </h2>
                            <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                              Đặt lúc {selectedOrder.date}
                            </p>
                          </div>
                          <span className={getShippingBadgeClass(selectedOrder.shippingStatus)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            <i className={getShippingBadgeIcon(selectedOrder.shippingStatus)}></i> {selectedOrder.shippingStatus}
                          </span>
                        </div>

                        {/* STEPPER PROGRESS */}
                        {selectedOrder.statusStep >= 0 && (
                          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '1.5rem 1rem', marginBottom: '1.5rem', border: '1px solid var(--rule)' }}>
                            <div className="tracking-steps">
                              <div className={`tracking-step ${selectedOrder.statusStep >= 0 ? 'done' : ''} ${selectedOrder.statusStep === 0 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 0 ? <i className="bi bi-check2"></i> : <i className="bi bi-receipt"></i>}
                                </div>
                                <div className="step-label">Đã đặt</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 1 ? 'done' : ''} ${selectedOrder.statusStep === 1 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 1 ? <i className="bi bi-check2"></i> : <i className="bi bi-patch-check"></i>}
                                </div>
                                <div className="step-label">Xác nhận</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 2 ? 'done' : ''} ${selectedOrder.statusStep === 2 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 2 ? <i className="bi bi-check2"></i> : <i className="bi bi-box-seam"></i>}
                                </div>
                                <div className="step-label">Đóng gói</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 3 ? 'done' : ''} ${selectedOrder.statusStep === 3 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 3 ? <i className="bi bi-check2"></i> : <i className="bi bi-truck"></i>}
                                </div>
                                <div className="step-label">Đang giao</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 4 ? 'done' : ''} ${selectedOrder.statusStep === 4 ? 'current' : ''}`}>
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
                            <div className="info-card-title">Địa chỉ nhận hàng</div>
                            <div className="info-card-text">
                              <strong style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--ink)' }}>
                                {selectedOrder.shippingAddress.name}
                              </strong>
                              <span style={{ display: 'block', marginBottom: '0.2rem' }}>
                                <i className="bi bi-telephone text-muted" style={{ marginRight: '0.4rem' }}></i>
                                {selectedOrder.shippingAddress.phone}
                              </span>
                              <span>
                                <i className="bi bi-geo-alt text-muted" style={{ marginRight: '0.4rem' }}></i>
                                {selectedOrder.shippingAddress.address}
                              </span>
                            </div>
                          </div>
                          
                          <div className="info-card">
                            <div className="info-card-title">Phương thức thanh toán</div>
                            <div className="info-card-text">
                              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--ink)' }}>
                                {selectedOrder.paymentMethod}
                              </span>
                              <div className="flex-center text-xs">
                                <span className={`status-badge ${selectedOrder.paymentStatus === 'Đã thanh toán' ? 'badge-completed' : 'badge-pending'}`} style={{ padding: '0.2rem 0.6rem' }}>
                                  {selectedOrder.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                          Sản phẩm trong đơn hàng
                        </div>
                        <div className="order-items-list">
                          {selectedOrder.items.map((item, idx) => (
                            <div className="order-item-row" key={idx}>
                              <img src={item.image} alt={item.name} className="order-item-img" />
                              <div className="order-item-info">
                                <div className="order-item-name">{item.name}</div>
                                <div className="order-item-meta">Phân loại: {item.variant} &middot; Số lượng: {item.quantity}</div>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SUMS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
                          
                          {/* TIMELINE MINI */}
                          <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                              Lịch sử vận chuyển
                            </div>
                            <div className="timeline" style={{ background: 'white', padding: '1rem', border: '1px solid var(--rule)', borderRadius: 'var(--r)' }}>
                              {selectedOrder.timeline.map((event, idx) => (
                                <div className="timeline-item" key={idx}>
                                  <div className={`timeline-dot ${event.current ? 'current' : ''} ${event.done ? 'done' : ''}`}>
                                    {event.current ? <i className="bi bi-truck"></i> : <i className="bi bi-check"></i>}
                                  </div>
                                  <div className="timeline-time">{event.time}</div>
                                  <div className="timeline-desc">{event.desc}</div>
                                  {event.sub && <div className="timeline-sub">{event.sub}</div>}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* TOTALS */}
                          <div className="order-totals-card" style={{ minWidth: '280px' }}>
                            <div className="total-row">
                              <span className="text-muted">Tạm tính:</span>
                              <span style={{ fontWeight: 600 }}>{formatPrice(selectedOrder.total - 30000)}</span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">Phí vận chuyển:</span>
                              <span style={{ fontWeight: 600 }}>{formatPrice(30000)}</span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">Giảm giá:</span>
                              <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>{formatPrice(0)}</span>
                            </div>
                            <div className="total-row grand-total">
                              <span>Tổng cộng:</span>
                              <span>{formatPrice(selectedOrder.total)}</span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Địa chỉ giao hàng
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                      {addresses.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
                          <div style={{ display: 'inline-flex', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--indigo-soft, #e0e7ff)', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)', marginBottom: '1rem' }}>
                            <MapPin size={28} />
                          </div>
                          <p style={{ margin: '0 0 1rem 0', color: 'var(--fg-soft)', fontSize: '0.95rem' }}>Bạn chưa lưu địa chỉ giao hàng nào.</p>
                          <button className="btn btn-sm btn--indigo" onClick={handleAddClick} style={{ padding: '0.5rem 1.25rem', borderRadius: '20px' }}>Thêm địa chỉ đầu tiên</button>
                        </div>
                      ) : (
                        addresses.map((addr: any) => (
                          <div key={addr.id} className={`address-card ${addr.is_default_shipping ? 'default' : ''}`} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {addr.is_default_shipping && (
                                <span className="status-badge badge-completed" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>Mặc định</span>
                              )}
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {addr.company === 'Văn phòng' ? (
                                <i className="bi bi-briefcase text-muted"></i>
                              ) : addr.company === 'Nhà riêng' ? (
                                <i className="bi bi-house text-muted"></i>
                              ) : (
                                <i className="bi bi-geo-alt text-muted"></i>
                              )}
                              {addr.company || 'Địa chỉ'}
                            </h4>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--fg-soft)' }}>
                              <strong>{`${addr.first_name || ''} ${addr.last_name || ''}`.trim()}</strong><br />
                              {addr.phone || 'Chưa có SĐT'}<br />
                              {[addr.address_1, addr.address_2, addr.city, addr.province].filter(part => part && part.trim() !== '').join(', ')}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '0.8rem' }}>
                              <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button 
                                  onClick={() => handleEditClick(addr)}
                                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  <i className="bi bi-pencil"></i> Chỉnh sửa
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  <i className="bi bi-trash"></i> Xóa
                                </button>
                              </div>
                              {!addr.is_default_shipping && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-mute)', background: 'none', border: 'none', cursor: 'pointer' }}
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
                      <button className="btn btn--indigo" onClick={handleAddClick} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-plus-lg"></i> Thêm địa chỉ mới
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Sản phẩm yêu thích ({wishlistIds.length})
                    </div>
                    
                    {isWishlistLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--indigo-line)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Đang tải...</p>
                      </div>
                    ) : wishlistProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ display: 'inline-flex', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--rose-soft, #fff1f2)', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)', marginBottom: '1rem' }}>
                          <Heart size={28} fill="var(--rose)" />
                        </div>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--fg-soft)', fontSize: '0.95rem' }}>Danh sách yêu thích của bạn đang trống</p>
                        <Link to="/products" className="btn btn-sm btn--indigo" style={{ padding: '0.5rem 1.25rem', borderRadius: '20px' }}>Mua sắm ngay</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.2rem' }}>
                        {wishlistProducts.map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WALLET TAB */}
              {activeTab === 'wallet' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Ví điện tử Sprylo
                      <button className="btn btn-sm btn--ghost" onClick={() => walletService.topupMock(5000000, 'cus_demo_123').then(res => setWalletData(res.wallet))}>
                        Nạp 5.000.000đ (Demo)
                      </button>
                    </div>
                    
                    <div className="wallet-card-bg" style={{ background: 'linear-gradient(135deg, var(--indigo) 0%, var(--card-purple) 100%)', borderRadius: 'var(--r-lg)', padding: '2rem', color: 'white', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                       <div style={{ position: 'relative', zIndex: 2 }}>
                         <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Số dư khả dụng</div>
                         <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--ff-display)' }}>
                           {walletData ? formatPrice(Number(walletData.balance)) : 'Đang tải...'}
                         </div>
                         <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                           <div>
                             <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Chủ tài khoản</div>
                             <div style={{ fontWeight: 600, letterSpacing: '1px' }}>{firstName.toUpperCase()} {lastName.toUpperCase()}</div>
                           </div>
                           <Wallet size={36} style={{ opacity: 0.5 }} />
                         </div>
                       </div>
                       <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                       <div style={{ position: 'absolute', right: '20%', bottom: '-30%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 1 }}></div>
                    </div>

                    <h4 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Lịch sử giao dịch</h4>
                    
                    {walletData?.transactions?.length > 0 ? (
                      <div className="wallet-transactions">
                        {[...walletData.transactions].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((tx: any) => (
                          <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--rule)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tx.type === 'payment' ? 'var(--rose-soft)' : 'var(--emerald-soft, #d1fae5)', color: tx.type === 'payment' ? 'var(--rose)' : 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {tx.type === 'payment' ? <Wallet size={18} /> : <CheckCircle size={18} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{tx.description || (tx.type === 'payment' ? 'Thanh toán đơn hàng' : 'Nạp tiền / Hoàn tiền')}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--fg-mute)' }}>{new Date(tx.created_at).toLocaleString('vi-VN')}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: tx.type === 'payment' ? 'var(--ink)' : 'var(--emerald)' }}>
                              {tx.type === 'payment' ? '-' : '+'}{formatPrice(Number(tx.amount))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--fg-mute)', background: 'var(--bg-soft)', borderRadius: 'var(--r)' }}>
                        Chưa có giao dịch nào
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASSWORD TAB */}
              {activeTab === 'password' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--indigo) 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.2 }}>Đổi mật khẩu</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--fg-mute)', marginTop: '2px' }}>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</div>
                      </div>
                    </div>

                    {/* Security tips */}
                    <div style={{ background: 'var(--indigo-soft, #eef2ff)', border: '1px solid var(--indigo-line, #c7d2fe)', borderRadius: 'var(--r)', padding: '1rem 1.2rem', marginBottom: '1.8rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <AlertCircle size={16} style={{ color: 'var(--indigo)', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.82rem', color: 'var(--indigo-dark, #3730a3)', lineHeight: 1.6 }}>
                        <strong>Lưu ý bảo mật:</strong> Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt. Không chia sẻ mật khẩu với bất kỳ ai.
                      </div>
                    </div>

                    {/* Error alert */}
                    {pwError && (
                      <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '1.4rem' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{pwError}</span>
                      </div>
                    )}

                    {/* Success alert */}
                    {pwSuccess && (
                      <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.4rem' }}>
                        <CheckCircle size={16} />
                        <span>Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho lần đăng nhập tiếp theo.</span>
                      </div>
                    )}

                    <div style={{ maxWidth: '480px' }}>
                      {/* Old password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="old-pw">Mật khẩu hiện tại *</label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="old-pw"
                            type={showOldPw ? 'text' : 'password'}
                            className={`form-control ${pwFieldErrors.old ? 'is-invalid' : ''}`}
                            placeholder="Nhập mật khẩu hiện tại..."
                            value={oldPassword}
                            onChange={(e) => { setOldPassword(e.target.value); setPwFieldErrors(p => ({ ...p, old: undefined })); setPwError(''); }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button type="button" className="toggle-pw" onClick={() => setShowOldPw(v => !v)} tabIndex={-1}>
                            {showOldPw ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                        {pwFieldErrors.old && <div className="form-error" style={{ marginTop: '4px' }}>{pwFieldErrors.old}</div>}
                      </div>

                      {/* New password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pw">Mật khẩu mới *</label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="new-pw"
                            type={showNewPw ? 'text' : 'password'}
                            className={`form-control ${pwFieldErrors.new ? 'is-invalid' : ''}`}
                            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)..."
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPwFieldErrors(p => ({ ...p, new: undefined })); setPwError(''); }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button type="button" className="toggle-pw" onClick={() => setShowNewPw(v => !v)} tabIndex={-1}>
                            {showNewPw ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                        {pwFieldErrors.new && <div className="form-error" style={{ marginTop: '4px' }}>{pwFieldErrors.new}</div>}

                        {/* Password strength bar */}
                        {newPassword && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{
                                  flex: 1, height: '4px', borderRadius: '4px',
                                  background: i <= pwStrength.score ? pwStrength.color : 'var(--rule)',
                                  transition: 'background 0.3s'
                                }} />
                              ))}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: pwStrength.color, fontWeight: 600 }}>
                              Độ mạnh: {pwStrength.label}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm new password */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="confirm-pw">Xác nhận mật khẩu mới *</label>
                        <div className="input-icon-wrap">
                          <Lock size={17} className="bi" />
                          <input
                            id="confirm-pw"
                            type={showConfirmPw ? 'text' : 'password'}
                            className={`form-control ${
                              pwFieldErrors.confirm
                                ? 'is-invalid'
                                : confirmNewPassword && confirmNewPassword === newPassword
                                ? 'is-valid'
                                : ''
                            }`}
                            placeholder="Nhập lại mật khẩu mới..."
                            value={confirmNewPassword}
                            onChange={(e) => { setConfirmNewPassword(e.target.value); setPwFieldErrors(p => ({ ...p, confirm: undefined })); }}
                            disabled={pwLoading || pwSuccess}
                          />
                          <button type="button" className="toggle-pw" onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}>
                            {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                        {pwFieldErrors.confirm && <div className="form-error" style={{ marginTop: '4px' }}>{pwFieldErrors.confirm}</div>}
                        {confirmNewPassword && confirmNewPassword === newPassword && !pwFieldErrors.confirm && (
                          <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={13} /> Mật khẩu khớp
                          </div>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.8rem', marginTop: '2rem' }}>
                        <button
                          className="btn btn--ghost"
                          onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); setPwFieldErrors({}); setPwError(''); setPwSuccess(false); }}
                          disabled={pwLoading}
                        >
                          Hủy
                        </button>
                        <button
                          id="change-password-submit"
                          className="btn btn--indigo"
                          onClick={handleChangePassword}
                          disabled={pwLoading || pwSuccess}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'center', opacity: pwLoading || pwSuccess ? 0.8 : 1 }}
                        >
                          {pwLoading ? (
                            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang cập nhật...</>
                          ) : pwSuccess ? (
                            <><CheckCircle size={18} /> Đã cập nhật!</>
                          ) : (
                            <><Shield size={18} /> Cập nhật mật khẩu</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* POLICIES TAB (Seller) */}
              {activeTab === 'policies' && (
                <div id="tab-policies" className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Quản lý Chính sách Sản phẩm (Seller)
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      Thiết lập các chính sách bảo hành và đổi trả áp dụng cho các sản phẩm của bạn. Các thay đổi sẽ được hiển thị ngay trên trang chi tiết sản phẩm.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label className="form-label">Chọn sản phẩm cần áp dụng:</label>
                        <select className="form-control" style={{ maxWidth: '400px' }}>
                          <option>— Áp dụng cho tất cả sản phẩm —</option>
                          <option>iPhone 15 Pro Max</option>
                          <option>Samsung Galaxy S24 Ultra</option>
                          <option>MacBook Pro M3</option>
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Chính sách bảo hành</label>
                          <input type="text" className="form-control" placeholder="Ví dụ: BH 12 tháng chính hãng" defaultValue="BH 12 tháng chính hãng" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Chính sách đổi trả</label>
                          <input type="text" className="form-control" placeholder="Ví dụ: Đổi trả 30 ngày" defaultValue="Đổi trả 30 ngày" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Chi tiết chính sách (Mô tả chi tiết)</label>
                        <textarea className="form-control" rows={4} defaultValue="Dòng sản phẩm chính hãng Apple Việt Nam. Đổi mới trong 30 ngày đầu nếu có lỗi phần cứng từ nhà sản xuất. Bảo hành 12 tháng tại các trung tâm bảo hành ủy quyền của Apple trên toàn quốc."></textarea>
                      </div>

                      <button className="btn btn--indigo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <h3>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                <button className="close-btn" onClick={() => setShowAddressModal(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="address-modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Họ và tên người nhận *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nguyễn Văn A" 
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
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
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Tỉnh / Thành phố *</label>
                    <select 
                      className="form-control" 
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Quận / Huyện *</label>
                    <select 
                      className="form-control" 
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Phường / Xã *</label>
                    <select 
                      className="form-control" 
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((w: any) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Địa chỉ chi tiết *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Số nhà, tên đường..." 
                      value={addrDetail}
                      onChange={(e) => setAddrDetail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label">Loại địa chỉ</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    {['Nhà riêng', 'Văn phòng', 'Khác'].map((label) => (
                      <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, color: 'var(--fg-soft)' }}>
                        <input 
                          type="radio" 
                          name="addressType" 
                          value={label}
                          checked={addrCompany === label}
                          onChange={() => setAddrCompany(label)}
                          style={{ accentColor: 'var(--indigo)' }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {(!editingAddress || !editingAddress.is_default_shipping) && (
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, color: 'var(--fg-soft)', marginTop: '0.8rem' }}>
                      <input 
                        type="checkbox" 
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        style={{ accentColor: 'var(--indigo)' }}
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                )}
              </div>
              <div className="address-modal-footer">
                <button className="btn btn--ghost" onClick={() => setShowAddressModal(false)}>Hủy</button>
                <button className="btn btn--indigo" onClick={handleSaveAddress}>Lưu địa chỉ</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountPage;