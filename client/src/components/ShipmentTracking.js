import React, { useState, useRef } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ShipmentTracking = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const [fedexFile, setFedexFile] = useState(null);
  const [upsFile, setUpsFile] = useState(null);
  const [fedexDownloadLink, setFedexDownloadLink] = useState("");
  const [upsDownloadLink, setUpsDownloadLink] = useState("");
  const [isDraggingFedex, setIsDraggingFedex] = useState(false);
  const [isDraggingUPS, setIsDraggingUPS] = useState(false);

  const fedexInputRef = useRef(null);
  const upsInputRef = useRef(null);

  const showStatus = (message, type = "info") => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleDragEnter = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();
    if (carrier === "FedEx") setIsDraggingFedex(true);
    else setIsDraggingUPS(true);
  };

  const handleDragLeave = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();
    if (carrier === "FedEx") setIsDraggingFedex(false);
    else setIsDraggingUPS(false);
  };

  const handleDrop = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();

    if (carrier === "FedEx") setIsDraggingFedex(false);
    else setIsDraggingUPS(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      if (carrier === "FedEx") setFedexFile(file);
      else setUpsFile(file);
      showStatus(`${carrier} file selected: ${file.name}`, "success");
    } else {
      showStatus("Please upload a CSV file", "danger");
    }
  };

  const handleUpload = async (e, carrier) => {
    e.preventDefault();
    const formData = new FormData();
    const file = carrier === "FedEx" ? fedexFile : upsFile;
    if (!file) return showStatus(`Please select a ${carrier} file.`, "warning");

    formData.append("file", file);

    try {
      showStatus(`Processing ${carrier} file...`, "info");
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = (
          <a
            href={downloadUrl}
            download={`${carrier.toLowerCase()}_tracking_details.xlsx`}
            className="btn btn-success d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-download"></i>
            Download {carrier} Tracking Details
          </a>
        );
        if (carrier === "FedEx") setFedexDownloadLink(link);
        else setUpsDownloadLink(link);

        showStatus(
          `${carrier} tracking details generated successfully!`,
          "success"
        );
      } else {
        showStatus(`Error generating ${carrier} tracking details`, "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus(`Failed to connect to the ${carrier} server.`, "danger");
    }
  };

  const handleFileChange = (e, carrier) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      if (carrier === "FedEx") setFedexFile(file);
      else setUpsFile(file);
      showStatus(`${carrier} file selected: ${file.name}`, "success");
    } else {
      showStatus("Please upload a CSV file", "danger");
    }
  };

  const ShipmentCard = ({
    carrier,
    logo,
    isDragging,
    file,
    downloadLink,
    inputRef,
  }) => (
    <div className="col-md-6 mb-4">
      <div className="card h-100 shadow border-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src={logo}
              alt={`${carrier} Logo`}
              className="img-fluid mb-3"
              style={{ maxHeight: "80px" }}
            />
            <h4 className="card-title">{carrier} Tracking</h4>
          </div>

          <form onSubmit={(e) => handleUpload(e, carrier)} className="mt-4">
            <div
              className={`drop-zone p-5 mb-4 rounded-3 text-center position-relative ${
                isDragging ? "bg-light border-primary" : "bg-light"
              }`}
              style={{
                border: `2px dashed ${isDragging ? "#0d6efd" : "#dee2e6"}`,
                transition: "all 0.3s ease",
              }}
              onDragEnter={(e) => handleDragEnter(e, carrier)}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => handleDragLeave(e, carrier)}
              onDrop={(e) => handleDrop(e, carrier)}
              onClick={() => inputRef.current?.click()}
            >
              <input
                type="file"
                ref={inputRef}
                className="d-none"
                accept=".csv"
                onChange={(e) => handleFileChange(e, carrier)}
              />
              <div className="mb-3">
                <i
                  className={`bi ${
                    file ? "bi-file-earmark-check" : "bi-cloud-upload"
                  } fs-1 ${isDragging ? "text-primary" : "text-secondary"}`}
                ></i>
              </div>
              <div className="mb-2">
                {file ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-2"></i>
                    {file.name}
                  </span>
                ) : (
                  <span>Drag & drop your {carrier} CSV file here</span>
                )}
              </div>
              <div className="text-muted small">or click to browse</div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-100 mb-3 ${
                !file ? "disabled" : ""
              }`}
              disabled={!file}
            >
              <i className="bi bi-gear me-2"></i>
              Generate {carrier} Tracking Details
            </button>
          </form>

          <div className="text-center mt-3">{downloadLink}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-2">
      <div className="text-center d-flex justify-content-center mb-2">
        <div className="text-center">
          <h4 className="fw-bolder mb-3">Shipment Tracking System</h4>
          <p className="text-muted fw-medium">
            Upload your tracking files to generate detailed reports
          </p>
        </div>
        
      </div>

      {statusMessage && (
        <div
          className={`alert alert-${statusMessage.type} alert-dismissible fade show mt-4`}
          role="alert"
        >
          <i
            className={`bi bi-${
              statusMessage.type === "success"
                ? "check-circle"
                : "exclamation-circle"
            } me-2`}
          ></i>
          {statusMessage.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row g-4">
        <ShipmentCard
          carrier="FedEx"
          logo="/fedex.webp"
          isDragging={isDraggingFedex}
          file={fedexFile}
          downloadLink={fedexDownloadLink}
          inputRef={fedexInputRef}
        />
        <ShipmentCard
          carrier="UPS"
          logo="/ups.jpg"
          isDragging={isDraggingUPS}
          file={upsFile}
          downloadLink={upsDownloadLink}
          inputRef={upsInputRef}
        />
      </div>
    </div>
  );
};

export default ShipmentTracking;
