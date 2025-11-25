// src/components/homepage/WeeklyBestDeals.jsx
import React, { useRef } from "react";
import "./WeeklyBestDeals.css";
import defaultTshirt from "../../assets/img2.webp";

const WeeklyBestDeals = ({ products = [] }) => {
  const carouselRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => { isDown = false; };
  const handleMouseUp = () => { isDown = false; };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="weekly-deals-container">
      <h2 className="section-title">Weekly Best Deals</h2>

      <div
        className="product-carousel"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="product-card">
              <img
  src={product.image || defaultTshirt}
  alt={product.name || "Product"}
  className="product-image"
/>

              <h3 className="product-name">{product.name || "Unnamed Product"}</h3>
              <p className="product-price">${product.price || "0.00"}</p>
            </div>
          ))
        ) : (
          <p>No deals available.</p>
        )}
      </div>
    </div>
  );
};

export default WeeklyBestDeals;
