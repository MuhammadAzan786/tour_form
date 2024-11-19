import React, { useEffect, useRef, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { Pannellum } from "pannellum-react";

const PropertyForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    rooms: "",
    bathrooms: "",
    area: "",
    address: "",
  });
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [hotspotData, setHotspotData] = useState({
    name: "",
    linkedImage: "",
    pitch: "",
    yaw: "",
  });
  const [pitchYaw, setPitchYaw] = useState({ pitch: 10, yaw: 180 });
  const panoramaRef = useRef(null);
  let viewerInstance = null;

  useEffect(() => {
    if (panoramaRef.current) {
      // Get the Pannellum viewer instance
      viewerInstance = panoramaRef.current.getViewer();
      console.log("innnn");
      if (viewerInstance) {
        const handleMouseMove = () => {
          setPitchYaw({
            pitch: viewerInstance.getPitch().toFixed(2),
            yaw: viewerInstance.getYaw().toFixed(2),
          });
        };

        // Attach event listener directly to the Pannellum viewer
        viewerInstance.on("mousemove", handleMouseMove);

        // Clean up event listener on component unmount
        return () => {
          viewerInstance.off("mousemove", handleMouseMove);
        };
      }
    }
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImage = {
        file,
        name: "",
        url: URL.createObjectURL(file),
      };
      setImages([...images, newImage]);
    }
  };

  const handleImageNameChange = (idx, name) => {
    const updatedImages = [...images];
    updatedImages[idx].name = name;
    setImages(updatedImages);
  };

  const handleImageSelection = (image) => {
    setCurrentImage(image);
    setHotspots([]); // Reset hotspots when a new image is selected
  };

  const handlePannellumClick = (evt) => {
    const { pitch, yaw } = evt;
    setHotspotData({ ...hotspotData, pitch, yaw });
  };

  const handleHotspotAdd = () => {
    if (
      hotspotData.name &&
      hotspotData.linkedImage &&
      hotspotData.pitch &&
      hotspotData.yaw
    ) {
      setHotspots([
        ...hotspots,
        {
          name: hotspotData.name,
          linkedImage: hotspotData.linkedImage,
          pitch: parseFloat(hotspotData.pitch),
          yaw: parseFloat(hotspotData.yaw),
        },
      ]);
      setHotspotData({ name: "", linkedImage: "", pitch: "", yaw: "" });
    } else {
      alert("Please fill in all hotspot fields");
    }
  };

  return (
    <div>
      <Stepper activeStep={activeStep}>
        <Step key="Details">
          <StepLabel>Property Details</StepLabel>
        </Step>
        <Step key="Images">
          <StepLabel>Add 360° Images</StepLabel>
        </Step>
        <Step key="Hotspots">
          <StepLabel>Add Hotspots</StepLabel>
        </Step>
      </Stepper>

      {/* Step 1: Property Details */}
      {activeStep === 0 && (
        <div>
          <Typography variant="h6">Enter Property Details</Typography>
          <TextField
            label="Number of Rooms"
            name="rooms"
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            label="Number of Bathrooms"
            name="bathrooms"
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            label="Area"
            name="area"
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            label="Address"
            name="address"
            onChange={handleFormChange}
            fullWidth
          />
          <Button onClick={handleNext}>Next</Button>
        </div>
      )}

      {/* Step 2: Image Upload */}
      {activeStep === 1 && (
        <div>
          <Typography variant="h6">Upload 360° Images</Typography>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {images.map((img, idx) => (
            <div key={idx}>
              <img
                src={img.url}
                alt={`Preview ${idx}`}
                style={{ width: "100px", margin: "5px" }}
              />
              <TextField
                label="Image Name"
                value={img.name}
                onChange={(e) => handleImageNameChange(idx, e.target.value)}
                fullWidth
              />
            </div>
          ))}
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleNext} disabled={images.length === 0}>
            Next
          </Button>
        </div>
      )}

      {/* Step 3: Add Hotspots */}
      {activeStep === 2 && (
        <div>
          <Typography variant="h6">Add Hotspots</Typography>
          {images.map((img, idx) => (
            <Button key={idx} onClick={() => handleImageSelection(img)}>
              View {img.name}
            </Button>
          ))}
          {currentImage && (
            <div>
              <Pannellum
                ref={panoramaRef}
                id="panorama"
                width="100%"
                height="500px"
                image={currentImage.url}
                pitch={pitchYaw.pitch}
                yaw={pitchYaw.yaw}
                hfov={110}
                autoLoad
                onDoubleClick={handlePannellumClick}
              >
                {hotspots.map((hotspot, index) => (
                  <Pannellum.Hotspot
                    key={index}
                    type="info"
                    pitch={hotspot.pitch}
                    yaw={hotspot.yaw}
                    text={hotspot.name}
                    handleClick={() =>
                      alert(`Clicked on hotspot: ${hotspot.name}`)
                    }
                  />
                ))}
              </Pannellum>
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "5px",
                  borderRadius: "4px",
                }}
              >
                Pitch: {pitchYaw.pitch}°, Yaw: {pitchYaw.yaw}°
              </div>
              <Typography variant="h6" style={{ marginTop: "20px" }}>
                Add Hotspot for {currentImage.name}
              </Typography>
              <TextField
                label="Hotspot Name"
                value={hotspotData.name}
                onChange={(e) =>
                  setHotspotData({ ...hotspotData, name: e.target.value })
                }
                fullWidth
              />
              <TextField
                select
                label="Linked Image"
                value={hotspotData.linkedImage}
                onChange={(e) =>
                  setHotspotData({
                    ...hotspotData,
                    linkedImage: e.target.value,
                  })
                }
                fullWidth
              >
                {images.map((img, idx) => (
                  <MenuItem key={idx} value={img.name}>
                    {img.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Pitch"
                type="number"
                value={hotspotData.pitch}
                onChange={(e) =>
                  setHotspotData({ ...hotspotData, pitch: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Yaw"
                type="number"
                value={hotspotData.yaw}
                onChange={(e) =>
                  setHotspotData({ ...hotspotData, yaw: e.target.value })
                }
                fullWidth
              />
              <Button onClick={handleHotspotAdd} style={{ marginTop: "10px" }}>
                Add Hotspot
              </Button>
            </div>
          )}
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleNext}>Finish</Button>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;
