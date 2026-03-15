import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Report filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    orderStatus: '',
    paymentStatus: ''
  });

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/orders/myorders', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch orders');
        }

        setOrders(Array.isArray(data) ? data : []);
        setFilteredOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      loadOrders();
    }
  }, [user, isLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    if (filters.startDate) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    if (filters.orderStatus) {
      filtered = filtered.filter(order => order.orderStatus === filters.orderStatus);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(order => {
        if (filters.paymentStatus === 'paid') {
          return order.isPaid;
        } else if (filters.paymentStatus === 'unpaid') {
          return !order.isPaid;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [filters, orders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      orderStatus: '',
      paymentStatus: ''
    });
  };

  const getPaymentStatus = (order) => {
    return order.isPaid ? 'Payment Successful' : 'Pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Placed': '#ffc107',
      'Confirmed': '#17a2b8',
      'Shipped': '#007bff',
      'Out for Delivery': '#6f42c1',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentStatusColor = (isPaid) => {
    return isPaid ? '#28a745' : '#ffc107';
  };

  // Report generation functions
  const generatePDFReport = () => {
    try {
      // Check if jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
      }

      const reportData = filteredOrders.map(order => ({
        'Order ID': String(order._id).slice(-6),
        'Customer Name': order.shippingAddress?.fullName || 'N/A',
        'Product Name': order.orderItems?.map(item => item.name).join(', ') || 'N/A',
        'Quantity': order.orderItems?.reduce((sum, item) => sum + item.qty, 0) || 0,
        'Order Date': new Date(order.createdAt).toLocaleDateString('en-IN'),
        'Payment Status': getPaymentStatus(order),
        'Order Status': order.orderStatus,
        'Total Amount': Number(order.totalPrice || 0)
      }));

      // Create PDF content
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Helper function to format currency properly for PDF
      const formatCurrency = (amount) => {
        return `Rs. ${amount.toLocaleString('en-IN')}`;
      };
      
      // Add company header
      doc.setFontSize(24);
      doc.text('Shri Ahalya Tex', 105, 25, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Quality Traditional Textiles', 105, 32, { align: 'center' });
      doc.text('www.shriahalyatex.com', 105, 38, { align: 'center' });
      
      // Add separator line
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);
      
      // Add report title
      doc.setFontSize(18);
      doc.text('ORDERS REPORT', 105, 55, { align: 'center' });
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 105, 62, { align: 'center' });
      
      // Add filters info
      let filterText = 'Filters: ';
      if (filters.startDate) filterText += `From: ${filters.startDate} `;
      if (filters.endDate) filterText += `To: ${filters.endDate} `;
      if (filters.orderStatus) filterText += `Status: ${filters.orderStatus} `;
      if (filters.paymentStatus) filterText += `Payment: ${filters.paymentStatus === 'paid' ? 'Successful' : 'Pending'}`;
      
      doc.text(filterText, 105, 69, { align: 'center' });
      
      // Add separator line
      doc.line(20, 75, 190, 75);
      
      // Add summary section
      doc.setFontSize(14);
      const totalAmount = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      doc.setFont(undefined, 'bold');
      doc.text('SUMMARY', 20, 85);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Orders: ${filteredOrders.length}`, 20, 93);
      doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 20, 100);
      
      // Add separator line
      doc.line(20, 108, 190, 108);
      
      // Add table headers
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      let yPosition = 116;
      const headers = ['Order ID', 'Customer', 'Products', 'Qty', 'Date', 'Payment', 'Status', 'Amount'];
      const columnWidths = [20, 30, 40, 15, 20, 25, 20, 25];
      let xPosition = 20;
      
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      
      yPosition += 8;
      
      // Add table data with proper formatting
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      reportData.forEach((row, index) => {
        if (yPosition > 260) { // Add new page if needed
          doc.addPage();
          yPosition = 20;
          // Re-add company header on new page
          doc.setFontSize(18);
          doc.text('Shri Ahalya Tex - Orders Report (Continued)', 105, 25, { align: 'center' });
          yPosition = 40;
          // Re-add headers on new page
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          xPosition = 20;
          headers.forEach((header, index) => {
            doc.text(header, xPosition, yPosition);
            xPosition += columnWidths[index];
          });
          yPosition += 8;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
        }
        
        xPosition = 20;
        const values = [
          row['Order ID'],
          row['Customer Name'].substring(0, 15),
          row['Product Name'].substring(0, 20),
          row['Quantity'].toString(),
          row['Order Date'],
          row['Payment Status'],
          row['Order Status'],
          formatCurrency(row['Total Amount'])
        ];
        
        values.forEach((value, colIndex) => {
          doc.text(value || 'N/A', xPosition, yPosition);
          xPosition += columnWidths[colIndex];
        });
        
        yPosition += 7;
      });
      
      // Add footer section
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Add separator line
        doc.setLineWidth(0.5);
        doc.line(20, 270, 190, 270);
        
        // Add footer text
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 275, { align: 'center' });
        doc.text('Thank you for your business!', 105, 280, { align: 'center' });
        doc.text('This is a computer generated report', 105, 285, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const generateExcelReport = () => {
    const reportData = filteredOrders.map(order => ({
      'Order ID': String(order._id).slice(-6),
      'Customer Name': order.shippingAddress?.fullName || 'N/A',
      'Product Name': order.orderItems?.map(item => item.name).join(', ') || 'N/A',
      'Quantity': order.orderItems?.reduce((sum, item) => sum + item.qty, 0) || 0,
      'Order Date': new Date(order.createdAt).toLocaleDateString('en-IN'),
      'Payment Status': getPaymentStatus(order),
      'Order Status': order.orderStatus,
      'Total Amount': Number(order.totalPrice || 0)
    }));

    // Create Excel-compatible CSV
    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_report_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login to view your dashboard.</div>;

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <h1 className="profile-title">Customer Dashboard</h1>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{orders.length}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Orders</h3>
              <p className="stat-number">{orders.filter(o => o.orderStatus === 'Delivered').length}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p className="stat-number">{orders.filter(o => !o.isDelivered && o.orderStatus !== 'Cancelled').length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Spent</h3>
              <p className="stat-number">
                ₹{orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="dashboard-actions">
            <button 
              className="report-btn" 
              onClick={() => setShowReportModal(true)}
              disabled={filteredOrders.length === 0}
            >
              📊 Generate Report
            </button>
            <button 
              className="view-orders-btn" 
              onClick={() => navigate('/my-orders')}
            >
              📋 View All Orders
            </button>
          </div>

          <div className="orders-section">
            <h2>Recent Orders</h2>
            
            {loading && <div style={{ padding: 12 }}>Loading...</div>}
            {!loading && error && (
              <div style={{ padding: 12, color: 'crimson' }}>
                {error}
              </div>
            )}

            {!loading && !error && filteredOrders.length === 0 && (
              <div className="empty-orders">
                <p>No orders found</p>
                <button className="shop-now-btn" onClick={() => navigate('/')}>
                  Start Shopping
                </button>
              </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td>#{String(order._id).slice(-6)}</td>
                        <td>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN')
                            : ''}
                        </td>
                        <td>{Array.isArray(order.orderItems) ? order.orderItems.length : 0}</td>
                        <td>₹ {Number(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getPaymentStatusColor(order.isPaid) }}
                          >
                            {getPaymentStatus(order)}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="view-orders-btn" 
                            onClick={() => navigate(`/orders/${order._id}`)}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Generate Order Report</h2>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="filter-section">
                <h3>Filters</h3>
                <div className="filter-grid">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Order Status</label>
                    <select
                      name="orderStatus"
                      value={filters.orderStatus}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="Placed">Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <select
                      name="paymentStatus"
                      value={filters.paymentStatus}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Payment Status</option>
                      <option value="paid">Payment Successful</option>
                      <option value="unpaid">Pending</option>
                    </select>
                  </div>
                </div>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>

              <div className="report-preview">
                <h3>Report Preview ({filteredOrders.length} orders)</h3>
                <div className="report-info">
                  <p>This report will include:</p>
                  <ul>
                    <li>Order ID</li>
                    <li>Customer Name</li>
                    <li>Product Name</li>
                    <li>Quantity</li>
                    <li>Order Date</li>
                    <li>Payment Status</li>
                    <li>Order Status</li>
                    <li>Total Amount</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="download-btn pdf-btn" 
                onClick={generatePDFReport}
                disabled={filteredOrders.length === 0}
              >
                📄 Download PDF
              </button>
              <button 
                className="download-btn excel-btn" 
                onClick={generateExcelReport}
                disabled={filteredOrders.length === 0}
              >
                📊 Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
