import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipmentForm from '../components/ShipmentForm';

const API_URL = 'https://shipment-tracker-assignment.onrender.com/api/shipments';

// --- Reusable Icon Components ---
const Logo = () => <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h16.5M4.5 14.25h15M5.25 10.5h13.5M12 3.75l3 3m-3-3l-3 3" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const StatsTotalIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7l8 4 8-4M12 15v4" /></svg>;
const StatsTransitIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
const StatsPendingIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StatsExpressIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StatsDeliveredIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


// --- Reusable Badge Components ---
const StatusBadge = ({ status }) => {
    const styles = { 'Pending': 'bg-yellow-100 text-yellow-800', 'In Transit': 'bg-blue-100 text-blue-800', 'Delivered': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};
const PriorityBadge = ({ isExpress }) => {
    return isExpress ? <span className="flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800"><StatsExpressIcon className="h-3 w-3 mr-1 text-orange-500" /> Express</span> : null;
};

// --- Helper to format dates ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- Stat Card Component ---
const StatCard = ({ title, value, description, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
        {icon}
    </div>
);

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({ total: 0, inTransit: 0, pending: 0, express: 0, delivered: 0 });
  const [editingShipment, setEditingShipment] = useState(null);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchShipmentsAndStats = useCallback(async () => {
    if (!user) return;

    try {
      const listUrl = new URL(API_URL);
      listUrl.searchParams.append('userId', user.id);
      if (filter) listUrl.searchParams.append('status', filter);
      if (searchTerm) listUrl.searchParams.append('search', searchTerm);
      listUrl.searchParams.append('page', currentPage);
      listUrl.searchParams.append('limit', 5);

      const listResponse = await fetch(listUrl);
      if (!listResponse.ok) throw new Error('Failed to fetch shipment list');
      const listData = await listResponse.json();
      setShipments(listData.shipments);
      setTotalPages(listData.totalPages);

      const allUrl = new URL(API_URL);
      allUrl.searchParams.append('userId', user.id);
      allUrl.searchParams.append('limit', 1000);
      const allResponse = await fetch(allUrl);
      if (!allResponse.ok) throw new Error('Failed to fetch all shipments for stats');
      const allData = await allResponse.json();
      
      const allShipments = allData.shipments;
      setStats({
          total: allShipments.length,
          inTransit: allShipments.filter(s => s.status === 'In Transit').length,
          pending: allShipments.filter(s => s.status === 'Pending').length,
          delivered: allShipments.filter(s => s.status === 'Delivered').length,
          express: allShipments.filter(s => s.expressDelivery).length
      });

      if(listData.shipments.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user, filter, searchTerm, currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (user) {
          fetchShipmentsAndStats();
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [user, searchTerm, filter, currentPage, fetchShipmentsAndStats]);

  const handleOpenCreateModal = () => {
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shipment) => {
    setEditingShipment(shipment);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    fetchShipmentsAndStats();
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        fetchShipmentsAndStats();
      } catch (error) {
        console.error('Error deleting shipment:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Shipment Tracker</h1>
              <p className="text-sm text-gray-500">Manage your shipments</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            <button onClick={handleLogout} title="Logout" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                <LogoutIcon />
                <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard title="Total Shipments" value={stats.total} description="All time shipments" icon={<StatsTotalIcon className="text-gray-400" />} />
            <StatCard title="In Transit" value={stats.inTransit} description="Currently shipping" icon={<StatsTransitIcon className="text-blue-500" />} />
            <StatCard title="Pending" value={stats.pending} description="Awaiting processing" icon={<StatsPendingIcon className="text-yellow-500" />} />
            <StatCard title="Delivered" value={stats.delivered} description="Completed" icon={<StatsDeliveredIcon className="text-green-500" />} />
            <StatCard title="Express" value={stats.express} description="High priority" icon={<StatsExpressIcon className="text-orange-500" />} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Shipments</h2>
                    <p className="text-sm text-gray-500">Manage and track your shipments</p>
                </div>
                <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    + Create Shipment
                </button>
            </div>
            <div className="border-b border-gray-200 mb-4 pb-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-3">
                    <FilterIcon />
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by:</label>
                    <select id="status-filter" value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }} className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search shipments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {shipments.length > 0 ? (
                    shipments.map((shipment) => (
                        <div key={shipment.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-wrap justify-between items-center">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="font-bold text-gray-800">{shipment.trackingId}</p>
                                    <StatusBadge status={shipment.status} />
                                    <PriorityBadge isExpress={shipment.expressDelivery} />
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarIcon />
                                    <span>Created: {formatDate(shipment.createdAt)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <button onClick={() => handleOpenEditModal(shipment)} title="Edit" className="p-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100"><EditIcon /></button>
                                <button onClick={() => handleDelete(shipment.id)} title="Delete" className="p-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100"><DeleteIcon /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>No shipments found.</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-6">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50">Next</button>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <ShipmentForm
            shipmentToEdit={editingShipment}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
            userId={user.id}
        />
      )}
    </div>
  );
};

export default DashboardPage;
