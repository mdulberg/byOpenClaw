const shell = document.querySelector('[data-product-shell]');
const crumbsEl = document.querySelector('[data-breadcrumbs]');

const formatPrice = (value, currency = 'EUR') => {
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(value);
  } catch {
    return `€${value}`;
  }
};

const getProductId = () => new URLSearchParams(window.location.search).get('id');

const reviewLabel = (product) => {
  if (product.badge === 'Bestseller') return '4.9 ★ Bestseller rating';
  if (product.badge === 'Limited') return '4.8 ★ Limited edition favorite';
  return '4.8 ★ Highly rated';
};

const renderNotFound = () => {
  if (!shell) return;
  shell.innerHTML = `
    <div class="about-panel">
      <h2>Piece not found</h2>
      <p class="detail-desc">We couldn’t find that item. Please head back to the collection and browse the available pieces.</p>
      <div class="detail-actions">
        <a class="cta cta--solid" href="index.html#catalog">Back to collection</a>
      </div>
    </div>
  `;
};

const renderProduct = (product) => {
  if (!shell) return;

  const { name, price, currency, metal, style, size, image, badge, description, details } = product;
  const cacheBust = 'v=20260327c';
  const images = (Array.isArray(image) ? image : [image]).map((src) => `${src}${src.includes('?') ? '&' : '?'}${cacheBust}`);

  document.title = `${name} | Anaya Jewelry`;

  if (crumbsEl) {
    crumbsEl.textContent = `Home / Collection / ${name}`;
  }

  shell.innerHTML = `
    <div class="detail-media">
      ${badge ? `<span class="badge">${badge}</span>` : ''}
      <div class="detail-images">
        ${images.map((src, index) => `
          <div class="detail-image-frame">
            <img
              src="${src}"
              alt="${name}${images.length > 1 ? ` image ${index + 1}` : ''}"
              loading="eager"
              decoding="async"
              onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend','<div class=\"image-fallback\">This image is temporarily unavailable. Please refresh the page.</div>');"
            >
          </div>
        `).join('')}
      </div>
    </div>

    <div class="detail-info">
      <p class="eyebrow">Anaya Jewelry</p>
      <h1>${name}</h1>
      <p class="detail-price">${formatPrice(price, currency)}</p>
      <div class="detail-meta">
        <span class="pill">${metal}</span>
        <span class="pill">${style}</span>
        <span class="pill">${size}</span>
      </div>

      <div class="detail-highlights">
        <div class="detail-highlight">
          <strong>${reviewLabel(product)}</strong>
          <span>Customer-favorite styling</span>
        </div>
        <div class="detail-highlight">
          <strong>Ships in 2–4 business days</strong>
          <span>Clear shipping expectation</span>
        </div>
        <div class="detail-highlight">
          <strong>Secure HTTPS site</strong>
          <span>Safe browsing experience</span>
        </div>
      </div>

      <p class="detail-desc">${description}</p>

      <div class="spec-card">
        <h2>Product details</h2>
        <ul class="detail-list">
          <li><strong>Material:</strong> ${metal}</li>
          <li><strong>Style:</strong> ${style}</li>
          <li><strong>Size:</strong> ${size}</li>
          ${(details || []).map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="spec-card">
        <h2>Why shoppers like it</h2>
        <ul class="detail-list">
          <li>Multiple product angles shown when available</li>
          <li>Clear specs and wearable sizing information</li>
          <li>Gift-friendly styling and easy browsing on mobile</li>
        </ul>
      </div>

      <div class="detail-actions">
        <a class="cta cta--solid" href="index.html#catalog">Browse more pieces</a>
        <a class="cta cta--ghost" href="mailto:anayaofstillorgan@gmail.com?subject=${encodeURIComponent(`Question about ${name}`)}">Ask about this piece</a>
      </div>
      <p class="note">Questions welcome — email anayaofstillorgan@gmail.com and we’ll help you choose the right piece.</p>
    </div>
  `;
};

const loadProduct = async () => {
  const id = getProductId();

  try {
    const res = await fetch('data/products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const product = data.find((item) => item.id === id) || data[0];

    if (!product) {
      renderNotFound();
      return;
    }

    renderProduct(product);
  } catch (err) {
    console.error(err);
    renderNotFound();
  }
};

document.addEventListener('DOMContentLoaded', loadProduct);
