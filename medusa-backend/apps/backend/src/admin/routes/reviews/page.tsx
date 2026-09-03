import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useState, useEffect } from "react";
import { Container, Heading, Text, Button, Input, Table } from "@medusajs/ui";

interface ReviewItem {
  id: number;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  product_title?: string;
  product_thumbnail?: string;
  images?: string[];
  user_avatar?: string;
}

// Bootstrap 5 / Standard SVG Icons
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

const IconStarFill = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#f59e0b" className="inline-block">
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

const IconStarEmpty = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#cbd5e1" className="inline-block">
    <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l3.977-.566a.564.564 0 0 0 .424-.308L7.886 2.27l1.775 3.601a.564.564 0 0 0 .424.308l3.977.566-2.906 2.768a.566.566 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
  </svg>
);

const ReviewsAdminPage = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({ total_reviews: 0, avg_rating: 0, five_star_count: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/reviews", {
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { total_reviews: 0, avg_rating: 0, five_star_count: 0 });
      }
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này khỏi hệ thống?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/admin/reviews?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        setStats(prev => ({
          ...prev,
          total_reviews: Math.max(0, prev.total_reviews - 1),
        }));
      } else {
        alert("Xóa thất bại!");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.product_title || r.product_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = selectedRatingFilter === "all" || r.rating === Number(selectedRatingFilter);

    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<IconStarFill key={i} />);
      } else {
        stars.push(<IconStarEmpty key={i} />);
      }
    }
    return <div className="inline-flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Heading level="h1" className="text-xl font-semibold text-gray-900">
            Quản lý Đánh giá & Bình luận
          </Heading>
          <Text className="text-xs text-gray-500 mt-0.5">
            Danh sách tất cả phản hồi và đánh giá từ khách hàng trên hệ thống
          </Text>
        </div>
        <Button 
          variant="secondary" 
          onClick={fetchReviews} 
          isLoading={loading}
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <IconRefresh />
          Tải lại
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Container className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tổng số đánh giá
          </Text>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.total_reviews}
          </div>
          <Text className="text-xs text-gray-400 mt-1">Từ tất cả khách hàng</Text>
        </Container>

        <Container className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Điểm đánh giá trung bình
          </Text>
          <div className="text-2xl font-bold text-amber-500 mt-2 flex items-center gap-1.5">
            {stats.avg_rating || "5.0"}
            <IconStarFill />
          </div>
          <Text className="text-xs text-gray-400 mt-1">Tính theo điểm 5 sao</Text>
        </Container>

        <Container className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Đánh giá 5 sao
          </Text>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {stats.five_star_count}
          </div>
          <Text className="text-xs text-gray-400 mt-1">Mức độ hài lòng tuyệt đối</Text>
        </Container>
      </div>

      {/* Filter and Search Bar */}
      <Container className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="w-full sm:w-80 relative">
            <Input
              type="search"
              placeholder="Tìm theo khách hàng, sản phẩm, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Text className="text-xs font-medium text-gray-600">Lọc theo số sao:</Text>
            <select
              value={selectedRatingFilter}
              onChange={(e) =>
                setSelectedRatingFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Tất cả mức sao</option>
              <option value={5}>5 Sao (Xuất sắc)</option>
              <option value={4}>4 Sao (Tốt)</option>
              <option value={3}>3 Sao (Trung bình)</option>
              <option value={2}>2 Sao (Kém)</option>
              <option value={1}>1 Sao (Rất kém)</option>
            </select>
          </div>
        </div>
      </Container>

      {/* Reviews Table */}
      <Container className="p-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Đang tải danh sách đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Không tìm thấy đánh giá nào phù hợp.
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row className="bg-gray-50 text-gray-600 font-medium text-xs border-b border-gray-200">
                <Table.HeaderCell className="w-16">ID</Table.HeaderCell>
                <Table.HeaderCell>Khách hàng</Table.HeaderCell>
                <Table.HeaderCell>Sản phẩm</Table.HeaderCell>
                <Table.HeaderCell className="w-28 text-center">Đánh giá</Table.HeaderCell>
                <Table.HeaderCell className="w-1/3">Nội dung</Table.HeaderCell>
                <Table.HeaderCell className="w-36">Ngày tạo</Table.HeaderCell>
                <Table.HeaderCell className="w-20 text-right">Thao tác</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredReviews.map((item) => (
                <Table.Row key={item.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                  <Table.Cell className="font-mono text-xs text-gray-500">
                    #{item.id}
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center gap-2.5">
                      {item.user_avatar ? (
                        <img 
                          src={item.user_avatar.startsWith('/') ? `http://localhost:9000${item.user_avatar}` : item.user_avatar} 
                          alt={item.user_name || "Avatar"}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200"
                        style={{ display: item.user_avatar ? 'none' : 'flex' }}
                      >
                        {(item.user_name || "K").trim().split(" ").pop()?.[0]?.toUpperCase() || "K"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">
                          {item.user_name || "Khách hàng"}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {item.user_id ? item.user_id.slice(0, 12) + "..." : ""}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="font-medium text-xs text-gray-800 line-clamp-1 max-w-xs">
                      {item.product_title || item.product_id}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="text-center">
                    {renderStars(item.rating)}
                  </Table.Cell>

                  <Table.Cell>
                    <Text className="text-xs text-gray-700 leading-relaxed">
                      {item.comment}
                    </Text>
                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.images.map((img, i) => (
                          <img key={i} src={img} alt="review attachment" className="w-8 h-8 object-cover rounded border border-gray-200" onClick={() => window.open(img, '_blank')} style={{ cursor: 'pointer' }} />
                        ))}
                      </div>
                    )}
                  </Table.Cell>

                  <Table.Cell className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Table.Cell>

                  <Table.Cell className="text-right">
                    <Button
                      variant="transparent"
                      size="small"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 flex items-center justify-end gap-1 text-xs"
                      onClick={() => handleDelete(item.id)}
                      isLoading={deletingId === item.id}
                    >
                      <IconTrash />
                      <span>Xóa</span>
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  );
};

import { Star } from "@medusajs/icons";

export const config = defineRouteConfig({
  label: "Đánh giá sản phẩm",
  icon: Star
});

export default ReviewsAdminPage;
