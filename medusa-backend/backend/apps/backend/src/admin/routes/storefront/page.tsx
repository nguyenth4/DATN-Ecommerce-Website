import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";
import { Container, Heading, Button, Text } from "@medusajs/ui";

const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 1.579-2.22A7.976 7.976 0 0 0 1.63 4H4.09zm-2.46 1.5a7.95 7.95 0 0 0-.585 2.5H4.09a12.83 12.83 0 0 1 .15-2.5H1.63zm0 6.5h2.61a12.83 12.83 0 0 1-.15 2.5H1.63a7.95 7.95 0 0 0 .585-2.5zM4.09 12H1.63a7.976 7.976 0 0 0 4.039 2.22A9.267 9.267 0 0 1 4.09 12zm2.062 0h3.696c.144.757.348 1.45.602 2.077A7.97 7.97 0 0 1 8 14.923a7.97 7.97 0 0 1-2.448-.846A9.26 9.26 0 0 1 6.152 12zM7.5 12h-2.355a11.758 11.758 0 0 0 .626 2.077A7.97 7.97 0 0 0 7.5 14.923V12z"/>
  </svg>
);

const StorefrontRedirectPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open("http://localhost:5174/?admin_sync=true", "_blank");
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className="p-8 max-w-lg mx-auto mt-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <IconGlobe />
      </div>
      <Heading level="h2" className="text-xl font-semibold text-gray-900 mb-2">
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
          background: "#2563eb",
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
