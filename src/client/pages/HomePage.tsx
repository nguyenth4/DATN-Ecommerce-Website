import { motion } from 'framer-motion';
import { useProductController } from '../controllers/useProductController';
import './HomePage.css';

const HomePage = () => {
  const { products, loading } = useProductController();

  return (
    <div className="home-page">
      <section className="hero">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-content"
        >
          <h1>iPhone 15 Pro Max</h1>
          <p>Titanium. So strong. So light. So Pro.</p>
          <button className="btn-primary">Mua ngay</button>
        </motion.div>
      </section>

      <section className="products-section">
        <h2>Sản phẩm nổi bật</h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="product-card"
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price.toLocaleString()}đ</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
