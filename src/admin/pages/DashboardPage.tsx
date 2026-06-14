import { motion } from 'framer-motion';
import { Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import './DashboardPage.css';

const statCards = [
  { title: 'Total Revenue', value: '₫124.5M', icon: DollarSign, color: '#10b981' },
  { title: 'Orders', value: '156', icon: ShoppingCart, color: '#3b82f6' },
  { title: 'Customers', value: '2,405', icon: Users, color: '#8b5cf6' },
  { title: 'Active Users', value: '42', icon: Activity, color: '#f59e0b' },
];

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="stat-card"
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <p>{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#ORD-001</td>
                  <td>Nguyen Van A</td>
                  <td>₫34,990,000</td>
                  <td><span className="status completed">Completed</span></td>
                </tr>
                <tr>
                  <td>#ORD-002</td>
                  <td>Tran Thi B</td>
                  <td>₫6,190,000</td>
                  <td><span className="status pending">Pending</span></td>
                </tr>
                <tr>
                  <td>#ORD-003</td>
                  <td>Le Van C</td>
                  <td>₫10,490,000</td>
                  <td><span className="status processing">Processing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
