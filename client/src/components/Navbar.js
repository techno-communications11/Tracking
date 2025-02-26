import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { RiLogoutBoxRLine } from "react-icons/ri";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear(); // Clears the local storage
    window.location.href = "/"; // Redirect to the home page
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
          <div className=" py-2 ms-auto ">
          <Button as={Link} to='/upslivetrack' className="btn fw-bold  bg-transparent mx-1 text-success bgn px-4 py-2 border-0 rounded-pill shadow-sm hover-shadow-lg transition-all">
          <img src="/ups.jpg" height={30}/> Live Track
          </Button>
        <Button as={Link} to='/livetrack' className="btn  fw-bold bg-transparent mx-1 text-success bgn px-4 py-2 border-0 rounded-pill shadow-sm hover-shadow-lg transition-all">
        <img src="/fedex.webp" height={30}/> &nbsp; Live Track
          </Button>
        <Button as={Link} to='/trainingdata' className="btn fw-bold bg-transparent mx-1 text-primary bgn px-4 py-2 border-0 rounded-pill shadow-sm hover-shadow-lg transition-all">
            Tracking Details
          </Button>
          
          <Button className="btn fw-bold btn-danger mx-1 px-4 py-2 border-0 rounded-pill shadow-sm hover-shadow-lg transition-all" onClick={handleLogout}>
           <RiLogoutBoxRLine className="fw-bold"/> Logout
          </Button>
        </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
