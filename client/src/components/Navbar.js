import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap"; // Added import for Button
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <img src="logo.webp" height={40} alt="Logo" />
          <a className="navbar-brand fw-bold fs-6" href="/home">
            Techno Communications LLC
          </a>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Button 
                as={Link} 
                to="/upslivetrack" 
                variant="outline-success"
                className="mx-1 px-4 py-2 rounded-pill shadow-sm"
              >
                <img src="/ups.jpg" height={30} alt="UPS" className="me-2" />
                UPS Live Track
              </Button>
            </li>
            <li className="nav-item">
              <Button 
                as={Link} 
                to="/livetrack" 
                variant="outline-success"
                className="mx-1 px-4 py-2 rounded-pill shadow-sm"
              >
                <img src="/fedex.webp" height={30} alt="FedEx" className="me-2" />
                FedEx Live Track
              </Button>
            </li>
            <li className="nav-item">
              <Button 
                as={Link} 
                to="/trackingdetails" 
                variant="outline-primary"
                className="mx-1 px-4 py-2 rounded-pill shadow-sm"
              >
                Tracking Details
              </Button>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/trainingdata">
                Training Data
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/trackingdetails">
                Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/marketstructure">
                Market Structure
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/management">
                Management
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/credentials">
                Credentials
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/register">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Button
                variant="danger"
                className="mx-2 btn-sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;