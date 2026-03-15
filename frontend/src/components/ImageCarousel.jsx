import { useState } from 'react';

export default function ImageCarousel({ images, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return <div className="image-carousel-placeholder">No images available</div>;
  }

  return (
    <div className="image-carousel">
      <div className="carousel-main">
        <button className="carousel-btn carousel-btn-prev" onClick={prevImage}>
          ‹
        </button>
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="carousel-main-image"
        />
        <button className="carousel-btn carousel-btn-next" onClick={nextImage}>
          ›
        </button>
        <div className="carousel-indicator">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
