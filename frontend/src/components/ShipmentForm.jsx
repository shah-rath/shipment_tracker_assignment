import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const API_URL = 'http://localhost:3001/api/shipments';
const STATUS_OPTIONS = ["Pending", "In Transit", "Delivered", "Cancelled"];

const ShipmentForm = ({ shipmentToEdit, onSave, onClose, userId }) => {
    const [trackingId, setTrackingId] = useState('');
    const [status, setStatus] = useState(STATUS_OPTIONS[0]);
    const [expressDelivery, setExpressDelivery] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!shipmentToEdit;

    useEffect(() => {
        if (isEditing) {
            setTrackingId(shipmentToEdit.trackingId);
            setStatus(shipmentToEdit.status);
            setExpressDelivery(shipmentToEdit.expressDelivery);
        } else {
            resetForm();
        }
    }, [shipmentToEdit, isEditing]);

    const resetForm = () => {
        setTrackingId('');
        setStatus(STATUS_OPTIONS[0]);
        setExpressDelivery(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!trackingId) {
            setError('Tracking ID is required.');
            return;
        }
        setError('');

        // Include the userId in the data sent to the backend
        const shipmentData = { trackingId, status, expressDelivery, userId };
        const url = isEditing ? `${API_URL}/${shipmentToEdit.id}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shipmentData),
            });
            const data = await response.json();
            if (!response.ok) {
                // Display the specific error message from the backend
                throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} shipment`);
            }
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };
    
    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">{isEditing ? 'Edit Shipment' : 'Create New Shipment'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700">Tracking ID</label>
                        <input id="trackingId" type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            {STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input id="expressDelivery" type="checkbox" checked={expressDelivery} onChange={(e) => setExpressDelivery(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="expressDelivery" className="ml-2 block text-sm text-gray-900">Express Delivery</label>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            {isEditing ? 'Update Shipment' : 'Save Shipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ShipmentForm;
