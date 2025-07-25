import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Chart } from 'react-google-charts';
import axios from 'axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SalonDashboard = () => {
  const { salonId } = useParams();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: 0,
    minStock: 5,
    price: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const res = await axios.get(`/api/dashboard/${salonId}`);
      setDashboardData(res.data);
    };

    const fetchInventory = async () => {
      const res = await axios.get(`/api/inventory/${salonId}`);
      setInventory(res.data);
    };

    fetchDashboardData();
    fetchInventory();
  }, [salonId]);

  const handleAddProduct = async () => {
    try {
      const res = await axios.post(`/api/inventory/${salonId}`, newProduct);
      setInventory([...inventory, res.data]);
      setNewProduct({ name: '', quantity: 0, minStock: 5, price: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await axios.put(`/api/inventory/${salonId}/${productId}`, { quantity: newQuantity });
      setInventory(inventory.map(p => 
        p._id === productId ? {...p, quantity: newQuantity} : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (!dashboardData) return <div>{t('loading')}...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{dashboardData.salon.name} - {t('dashboard')}</h1>
        <p>{t('lastUpdated')}: {format(new Date(), 'PPpp')}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{t('todayAppointments')}</h3>
          <p className="stat-value">{dashboardData.todayAppointments.length}</p>
        </div>
        <div className="stat-card">
          <h3>{t('weeklyRevenue')}</h3>
          <p className="stat-value">R{dashboardData.weeklyRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>{t('lowStockItems')}</h3>
          <p className="stat-value">{dashboardData.lowStockCount}</p>
        </div>
        <div className="stat-card">
          <h3>{t('technicians')}</h3>
          <p className="stat-value">{dashboardData.technicians.length}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>{t('appointmentTrends')}</h3>
          <Chart
            chartType="LineChart"
            data={[
              [t('day'), t('appointments')],
              ...dashboardData.appointmentTrends.map(day => [
                new Date(day.date).toLocaleDateString(), 
                day.count
              ])
            ]}
            width="100%"
            height="300px"
          />
        </div>

        <div className="chart-container">
          <h3>{t('servicePopularity')}</h3>
          <Chart
            chartType="PieChart"
            data={[
              [t('service'), t('bookings')],
              ...dashboardData.servicePopularity.map(service => [
                service._id, 
                service.count
              ])
            ]}
            width="100%"
            height="300px"
          />
        </div>
      </div>

      <div className="inventory-section">
        <h2>{t('inventoryManagement')}</h2>
        
        <div className="add-product-form">
          <h3>{t('addNewProduct')}</h3>
          <input
            type="text"
            placeholder={t('productName')}
            value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
          />
          <input
            type="number"
            placeholder={t('quantity')}
            value={newProduct.quantity}
            onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})}
          />
          <input
            type="number"
            placeholder={t('minStock')}
            value={newProduct.minStock}
            onChange={e => setNewProduct({...newProduct, minStock: parseInt(e.target.value)})}
          />
          <input
            type="number"
            placeholder={t('price')}
            value={newProduct.price}
            onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
            step="0.01"
          />
          <button onClick={handleAddProduct}>{t('addProduct')}</button>
        </div>

        <div className="inventory-list">
          <h3>{t('currentInventory')}</h3>
          <table>
            <thead>
              <tr>
                <th>{t('product')}</th>
                <th>{t('quantity')}</th>
                <th>{t('minStock')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(product => (
                <tr key={product._id} className={product.quantity <= product.minStock ? 'low-stock' : ''}>
                  <td>{product.name}</td>
                  <td>
                    <input 
                      type="number" 
                      value={product.quantity} 
                      onChange={e => handleUpdateStock(product._id, parseInt(e.target.value))}
                    />
                  </td>
                  <td>{product.minStock}</td>
                  <td>
                    {product.quantity <= product.minStock 
                      ? <span className="alert">{t('lowStock')}</span> 
                      : <span className="ok">{t('inStock')}</span>}
                  </td>
                  <td>
                    <button onClick={() => handleUpdateStock(product._id, product.quantity)}>
                      {t('update')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="technician-section">
        <h2>{t('technicianManagement')}</h2>
        
        <div className="technician-list">
          {dashboardData.technicians.map(tech => (
            <div key={tech._id} className="technician-card">
              <div className="tech-info">
                <h3>{tech.name}</h3>
                <p>{tech.specialty}</p>
                <p>{t('certified')}: {tech.certified ? '✅' : '❌'}</p>
              </div>
              <div className="certification-section">
                {!tech.certified && (
                  <button onClick={() => handleVerifyCertification(tech._id)}>
                    {t('verifyCertification')}
                  </button>
                )}
                <div className="cert-files">
                  {tech.certificationFiles.map((file, index) => (
                    <a key={index} href={`/uploads/${file}`} target="_blank" rel="noreferrer">
                      {t('certificate')} {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonDashboard;