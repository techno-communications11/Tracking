import React, { useState } from 'react';
import { Search, Package, Calendar, Clock, Truck, User, CheckCircle, AlertCircle } from 'lucide-react';

const LiveTrack = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
  };

  const handleTrack = async () => {
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch('http://localhost:3000/upload/gettrackindividual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      });
      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      setError('Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return '#28a745';
    if (statusLower.includes('in transit')) return '#007bff';
    if (statusLower.includes('pending')) return '#ffc107';
    return '#6c757d';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '—', time: '—' };
  
    const [date, time] = dateTime.split('T');
    
    // Create a new Date object with the given time (UTC)
    const dateObj = new Date(dateTime);
  
    // Use UTC methods to get the correct time in AM/PM format
    const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };
    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(dateObj);
    
    return {
      date: date,   // The date portion (e.g., 2025-01-13)
      time: formattedTime,  // The formatted time with AM/PM (e.g., 12:00 AM)
    };
  };

  return (
    <div className="container mt-4">
      {/* Header with animation */}
      <div className="text-center mb-2">
        <div className="mb-1">
          <Package 
            size={48} 
            className="text-primary mb-3"
            style={{
              animation: 'bounce 2s infinite',
            }}
          />
        </div>
        <h2 className="display-6 fw-bold text-gradient">Track your package &nbsp;<img src='/fedex.webp' height={80}/>
        </h2>
        <p className="text-muted lead">Enter your tracking number to get the latest status</p>
      </div>

      {/* Search Box with animation */}
      <div className="row justify-content-center mb-1">
        <div className="col-md-8">
          <div className="input-group input-group-lg shadow-sm hover-shadow transition">
            <span className="input-group-text bg-white border-end-0">
              <Search className="text-primary" size={24} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={handleInputChange}
              style={{ borderColor: '#dee2e6' }}
            />
            <button
              className="btn btn-primary px-2 fw-bold"
              onClick={handleTrack}
              disabled={loading}
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Tracking...' : 'Track Package'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State with animation */}
      {loading && (
        <div className="text-center my-1">
          <div className="spinner-grow text-primary" role="status" style={{
            animation: 'spin 1s linear infinite',
            width: '3rem',
            height: '3rem'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Message with icon */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center fade show" role="alert">
          <AlertCircle className="me-2" size={24} />
          <div>{error}</div>
        </div>
      )}

      {/* Tracking Results with hover effects */}
      {trackingData && (
        
        <div className="card shadow-lg border-0 rounded-3 animate__animated animate__fadeIn">
          <div className="card-header bg-white border-bottom p-2">
            <div className="d-flex align-items-center">
              <Truck className="text-primary me-3" size={32} />
              <div>
                <h4 className="mb-1 fw-bold">Tracking Details</h4>
                <p className="mb-0 text-muted">
                  Tracking Number: <span className="fw-semibold">{trackingData.trackingNumber}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="card-body p-3">
            <div className="row g-4">
              {/* Status Section */}
              <div className="col-12">
                <div className="d-flex align-items-start p-3 bg-light rounded-3">
                  <CheckCircle size={24} style={{ color: getStatusColor(trackingData.statusByLocale) }} />
                  <div className="ms-3">
                    <h5 className="mb-1 fw-bold">Status</h5>
                    <p className="mb-1 fs-5" style={{ color: getStatusColor(trackingData.statusByLocale) }}>
                      {trackingData.statusByLocale}
                    </p>
                    <p className="text-muted mb-0">{trackingData.description}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Date Section */}
              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100 hover-shadow">
                  <div className="d-flex align-items-start">
                    <Calendar className="text-primary" size={24} />
                    <div className="ms-3">
                      <h5 className="mb-2">Delivery Date</h5>
                      <p className="mb-0 fs-6"> Date: {formatDateTime(trackingData.deliveryDate).date} 
                         &nbsp; Time: {formatDateTime(trackingData.deliveryDate).time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information Section */}
              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100 hover-shadow">
                  <div className="d-flex align-items-start">
                    <User className="text-primary" size={24} />
                    <div className="ms-3">
                      <h5 className="mb-2">Delivery Information</h5>
                      <p className="mb-1">Attempts: {trackingData.deliveryAttempts}</p>
                      {trackingData.receivedByName && (
                        <p className="mb-0">Received By: {trackingData.receivedByName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .hover-shadow {
            transition: all 0.3s ease;
          }
          .hover-shadow:hover {
            transform: translateY(-2px);
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            60% {
              transform: translateY(-10px);
            }
          }
          .text-gradient {
            background: linear-gradient(45deg, #4a154b, #007bff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .transition {
            transition: all 0.3s ease;
          }
          .fade {
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default LiveTrack;