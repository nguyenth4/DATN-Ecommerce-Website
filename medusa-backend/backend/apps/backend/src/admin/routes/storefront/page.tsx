import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";
import { Container, Heading, Button, Text } from "@medusajs/ui";

const StorefrontRedirectPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open("http://localhost:5174/?admin_sync=true", "_blank");
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className="p-8 max-w-lg mx-auto mt-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        🌐
      </div>
      <Heading level="h2" className="text-xl font-bold text-gray-900 mb-2">
        Đang chuyển sang Cửa hàng Client (Tài khoản Admin)...
      </Heading>
      <Text className="text-sm text-gray-500 mb-6">
        Cửa hàng Sprylo Client đang được mở và tự động đăng nhập tài khoản Admin (sprylo123@gmail.com).
      </Text>
      <Button
        variant="primary"
        size="large"
        onClick={() => window.open("http://localhost:5174/?admin_sync=true", "_blank")}
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          fontWeight: 600,
          borderRadius: "8px",
          width: "100%",
          padding: "10px"
        }}
      >
        Mở Trang Cửa hàng & Đăng nhập Admin
      </Button>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Xem Cửa hàng (Client)",
});

export default StorefrontRedirectPage;
