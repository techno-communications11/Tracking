import React, { useState, useRef } from "react";

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

  const handleFedExUpload = async (e) => {
    e.preventDefault();
    if (!fedexFile) return showStatus("Please select a FedEx file.", "warning");

    const formData = new FormData();
    formData.append("file", fedexFile);

    try {
      showStatus("Processing FedEx file...", "info");
      const response = await fetch("http://localhost:3000/upload/upload-fedex", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        setFedexDownloadLink(
          <a
            href={downloadUrl}
            download="fedex_tracking_details.xlsx"
            className="btn btn-success"
          >
            <i className="bi bi-download"></i> Download FedEx Tracking Details
          </a>
        );
        showStatus("FedEx tracking details generated successfully!", "success");
      } else {
        showStatus("Error generating FedEx tracking details", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Failed to connect to the FedEx server.", "danger");
    }
  };

  const handleUPSUpload = async (e) => {
    e.preventDefault();
    if (!upsFile) return showStatus("Please select a UPS file.", "warning");

    const formData = new FormData();
    formData.append("file", upsFile);

    try {
      showStatus("Processing UPS file...", "info");
      const response = await fetch("http://localhost:3000/upload/upload-ups", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        setUpsDownloadLink(
          <a
            href={downloadUrl}
            download="ups_tracking_details.xlsx"
            className="btn btn-success"
          >
            <i className="bi bi-download"></i> Download UPS Tracking Details
          </a>
        );
        showStatus("UPS tracking details generated successfully!", "success");
      } else {
        showStatus("Error generating UPS tracking details", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Failed to connect to the UPS server.", "danger");
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
    onUpload,
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

          <form onSubmit={onUpload} className="mt-4">
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
      <div className="row g-4">
        <ShipmentCard
          carrier="FedEx"
          logo="/fedex.webp"
          isDragging={isDraggingFedex}
          file={fedexFile}
          downloadLink={fedexDownloadLink}
          inputRef={fedexInputRef}
          onUpload={handleFedExUpload}
        />
        <ShipmentCard
          carrier="UPS"
          logo="/ups.jpg"
          isDragging={isDraggingUPS}
          file={upsFile}
          downloadLink={upsDownloadLink}
          inputRef={upsInputRef}
          onUpload={handleUPSUpload}
        />
      </div>
      <p> Note*: The excel sheet  should only contain trackingNumbers with heading trackingNumber</p>
    </div>
  );
};

export default ShipmentTracking;
