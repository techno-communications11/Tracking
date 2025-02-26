import { BrowserRouter, Routes, Route } from "react-router-dom";
 import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute
import ShipmentTracking from "./components/ShipmentTracking";
import TrackingDetails from "./components/TrackingDetails";
import {Login} from './components/Login'
import LiveTrack from "./components/LiveTrack";
// import PrivateRoute from './components/PrivateRoute'
import UpsLiveTrack from "./components/UpsLiveTrack";

function App() {
  // Check if the user is authenticated
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <div className="App">
      <BrowserRouter>
        {/* Conditionally render Navbar only if authenticated and not on the login page */}
        {isAuthenticated && window.location.pathname !== '/' && <Navbar />}

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          <Route path="/home" element={<PrivateRoute element={<ShipmentTracking />} />} />
          <Route path="/trainingdata" element={<PrivateRoute element={<TrackingDetails />} />} />
          <Route path="/livetrack" element={<PrivateRoute element={<LiveTrack />} />} />
          <Route path="/upslivetrack" element={<PrivateRoute element={<UpsLiveTrack />} />} />
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
