import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/pending-sellers');
      setPendingSellers(response.data.sellers);
    } catch (err) {
      setError('Failed to load pending seller requests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/approve-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setSuccessMessage('Seller approved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to approve seller. Please try again.');
      console.error(err);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/reject-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setSuccessMessage('Seller rejected successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to reject seller. Please try again.');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Logged in as: <strong>{currentUser?.email}</strong></span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="p-6 grid grid-cols-1 gap-6">
        {/* Pending Seller Approvals Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pending Seller Approvals</h2>
            <button 
              onClick={fetchPendingSellers}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingSellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending seller approvals at this time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingSellers.map(seller => (
                    <tr key={seller._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{seller.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveSeller(seller._id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectSeller(seller._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dashboard Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
            <div className="text-3xl font-bold text-blue-600">$12,580</div>
            <p className="text-sm text-gray-600 mt-2">Total sales this month</p>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-semibold">↑ 12%</span> from last month
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">User Stats</h2>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">427</div>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold"><span className="text-blue-500">352</span> / <span className="text-purple-500">75</span></div>
                <p className="text-sm text-gray-600">Buyers / Sellers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Platform Health</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">99.98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.98%" }}></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">API Response</span>
                <span className="text-sm font-medium">245ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "82%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;