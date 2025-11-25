import React, { useMemo, useState } from 'react';
import {
  FiPlay,
  FiUpload,
  FiType,
  FiDroplet,
  FiSearch,
  FiTag,
  FiChevronRight,
  FiLayers,
  FiRefreshCcw,
  FiShoppingCart,
  FiHeart
} from 'react-icons/fi';
import './Customize.css';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    title: 'City Grid Capsule',
    description: 'Architectural lines, premium heavyweight cotton.',
    badge: 'Limited',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Chromatic Fade Pack',
    description: 'Dip-dyed gradients with tonal embroidery accents.',
    badge: 'Bestseller',
    price: 1599,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Motion Performance',
    description: 'Moisture-wicking tech jersey for high-output days.',
    badge: 'New',
    price: 2099,
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80'
  }
];

const CATEGORY_GROUPS = [
  {
    title: 'By Audience',
    items: ['Men', 'Women', 'Unisex', 'Kids']
  },
  {
    title: 'By Finish',
    items: ['Premium Cotton', 'Athleisure', 'Organic', 'Heavyweight']
  },
  {
    title: 'By Mood',
    items: ['Printed', 'Plain', 'Graphic', 'Custom Collab']
  }
];

const TSHIRT_TYPES = [
  { id: 'classic', label: 'Classic Fit', basePrice: 1299 },
  { id: 'oversized', label: 'Oversized', basePrice: 1499 },
  { id: 'performance', label: 'Performance', basePrice: 1699 },
  { id: 'luxury', label: 'Luxury Modal', basePrice: 1999 }
];

const COLOR_SWATCHES = [
  '#FFFFFF',
  '#111111',
  '#F5E5D3',
  '#E8E3FF',
  '#BFD7ED',
  '#FF6B6B',
  '#F4A261',
  '#2A9D8F',
  '#264653'
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const Customize = () => {
  const [selectedType, setSelectedType] = useState('classic');
  const [selectedColor, setSelectedColor] = useState('#111111');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('Minimal Luxe');
  const [fontFamily, setFontFamily] = useState('Space Grotesk');
  const [textColor, setTextColor] = useState('#ffffff');
  const [uploadedArt, setUploadedArt] = useState(null);
  const [finish, setFinish] = useState('embroidery');

  const typeMeta = useMemo(() => TSHIRT_TYPES.find((t) => t.id === selectedType), [selectedType]);

  const price = useMemo(() => {
    if (!typeMeta) return 0;
    const finishUpcharge = finish === 'embroidery' ? 199 : finish === 'foil' ? 249 : 0;
    const artUpcharge = uploadedArt ? 149 : 0;
    return (typeMeta.basePrice + finishUpcharge + artUpcharge) * quantity;
  }, [typeMeta, finish, uploadedArt, quantity]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedArt(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="customize-shell">
      <section className="customize-hero">
        <div className="hero-copy">
          <p className="eyebrow">Minimal tech · Luxe fashion</p>
          <h1>Design your statement tee</h1>
          <p>
            Build custom garments with couture-level polish: modular templates, premium blanks, and
            real-time pricing for every creative decision.
          </p>
          <div className="hero-actions">
            <button className="primary">
              Start customizing <FiChevronRight />
            </button>
            <button className="ghost">
              <FiPlay /> Watch the studio walkthrough
            </button>
          </div>
        </div>
        <div className="hero-meta">
          <div>
            <span>Fulfilment</span>
            <strong>72 hrs priority</strong>
          </div>
          <div>
            <span>Materials</span>
            <strong>Organic · Modal · Tech</strong>
          </div>
          <div>
            <span>Support</span>
            <strong>Live stylists</strong>
          </div>
        </div>
      </section>

      <section className="featured-grid">
        <header>
          <div>
            <p className="eyebrow">Featured capsules</p>
            <h2>Shop elevated blanks</h2>
          </div>
          <button className="ghost">
            Explore the shop <FiChevronRight />
          </button>
        </header>
        <div className="grid">
          {FEATURED_PRODUCTS.map((product) => (
            <article key={product.id} className="feature-card">
              <span className="badge">{product.badge}</span>
              <img src={product.image} alt={product.title} />
              <div className="card-body">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <div className="card-footer">
                  <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                  <div className="card-actions">
                    <button className="ghost">
                      <FiSearch /> Quick view
                    </button>
                    <button className="icon" aria-label="add to wishlist">
                      <FiHeart />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="categories-panel">
        <header>
          <div>
            <p className="eyebrow">Dial in fast</p>
            <h2>Browse by vibe</h2>
          </div>
          <button className="ghost">
            View all categories <FiChevronRight />
          </button>
        </header>
        <div className="category-grid">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.title} className="category-card">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <FiChevronRight /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="customize-builder" id="builder">
        <div className="builder-left">
          <div className="panel">
            <p className="eyebrow">Step 01</p>
            <h3>Select base</h3>
            <div className="type-grid">
              {TSHIRT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`type-card ${selectedType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span>{type.label}</span>
                  <small>₹{type.basePrice.toLocaleString('en-IN')}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Step 02</p>
            <h3>Palette + sizing</h3>
            <div className="swatches">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  className={`swatch ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`select ${color}`}
                />
              ))}
            </div>
            <div className="size-row">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={`chip ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="quantity">
              <span>Quantity</span>
              <div>
                <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Step 03</p>
            <h3>Artwork & typography</h3>
            <div className="field">
              <label>
                <FiType /> Custom text
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter headline"
              />
            </div>
            <div className="field inline">
              <label>Font</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {['Space Grotesk', 'Playfair Display', 'Montserrat', 'Inter'].map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div className="field inline">
              <label>
                <FiDroplet /> Text color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                <FiUpload /> Upload artwork
              </label>
              <div className="upload-box">
                <input type="file" accept="image/*" onChange={handleUpload} />
                <p>{uploadedArt ? 'Artwork added' : 'PNG / SVG / AI up to 50MB'}</p>
              </div>
            </div>
            <div className="field inline">
              <label>
                <FiLayers /> Finish
              </label>
              <select value={finish} onChange={(e) => setFinish(e.target.value)}>
                <option value="embroidery">3D embroidery</option>
                <option value="foil">Metallic foil</option>
                <option value="screen">Screen print</option>
              </select>
            </div>
          </div>
        </div>

        <div className="builder-right">
          <div className="preview-card" style={{ backgroundColor: selectedColor }}>
            <div className="preview-toolbar">
              <button>
                <FiRefreshCcw /> Reset view
              </button>
              <button>
                <FiTag /> Apply template
              </button>
            </div>
            <div className="preview-art" style={{ fontFamily, color: textColor }}>
              <span>{customText || 'Your text here'}</span>
              {uploadedArt && <img src={uploadedArt} alt="uploaded art" />}
            </div>
          </div>

          <div className="summary-card">
            <div>
              <p className="eyebrow">Investment</p>
              <h2>₹{price.toLocaleString('en-IN')}</h2>
              <p className="muted">Includes finishes, embellishments, and quantities selected.</p>
            </div>
            <div className="summary-actions">
              <button className="primary">
                <FiShoppingCart /> Add to cart
              </button>
              <button className="ghost">
                Save draft
              </button>
            </div>
            <ul className="summary-list">
              <li>
                <FiSearch /> Front / back live preview
              </li>
              <li>
                <FiUpload /> Cloud-saved assets
              </li>
              <li>
                <FiPlay /> Production-grade mockups
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Customize;
