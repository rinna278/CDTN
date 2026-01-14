import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

const CROP_WIDTH = 215;
const CROP_HEIGHT = 268;

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const ImageCropModal = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedArea | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation: number) => {
    setRotation(rotation);
  };

  const onCropCompleteHandler = useCallback(
    (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async (): Promise<Blob | null> => {
    try {
      const image = await createImage(imageUrl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx || !croppedAreaPixels) return null;

      // Set canvas size to match the cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      ctx.restore();

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/jpeg",
          0.95
        );
      });
    } catch (error) {
      console.error("Error creating cropped image:", error);
      return null;
    }
  };

  const handleSave = async () => {
    const croppedBlob = await createCroppedImage();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      handleClose();
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Chỉnh sửa ảnh
          </h3>
          <button style={closeButtonStyle} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Crop Area */}
        <div style={cropContainerStyle}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            cropSize={{ width: CROP_WIDTH, height: CROP_HEIGHT }}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteHandler}
            restrictPosition={false}
          />
        </div>

        {/* Controls */}
        <div style={controlsStyle}>
          <div style={controlGroupStyle}>
            <label style={labelStyle}>
              <ZoomIn size={16} /> Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={sliderStyle}
            />
            <span style={valueStyle}>{zoom.toFixed(1)}x</span>
          </div>

          <div style={controlGroupStyle}>
            <label style={labelStyle}>
              <RotateCw size={16} /> Xoay
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              style={sliderStyle}
            />
            <span style={valueStyle}>{rotation}°</span>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button style={secondaryButtonStyle} onClick={handleClose}>
            Hủy
          </button>
          <button style={primaryButtonStyle} onClick={handleSave}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to create image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1500,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "700px",
  maxHeight: "78vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  zIndex: 1111
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px",
  borderBottom: "1px solid #e5e7eb",
  marginTop: "4px"
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  color: "#6b7280",
  transition: "color 0.2s",
};

const cropContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "400px",
  backgroundColor: "#000",
};

const controlsStyle: React.CSSProperties = {
  padding: "20px 24px",
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const controlGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
  minWidth: "80px",
};

const sliderStyle: React.CSSProperties = {
  flex: 1,
  height: "6px",
  borderRadius: "3px",
  outline: "none",
  cursor: "pointer",
};

const valueStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#6b7280",
  minWidth: "50px",
  textAlign: "right",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  padding: "16px 24px",
  borderTop: "1px solid #e5e7eb",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#fff",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

export default ImageCropModal;
