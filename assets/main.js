const gridEl = document.querySelector('[data-product-grid]');
const searchInput = document.querySelector('[data-search-input]');
const styleFilter = document.querySelector('[data-style-filter]');
const metalFilter = document.querySelector('[data-metal-filter]');
const categoryButtons = Array.from(document.querySelectorAll('[data-category-filter]'));
const resultsMeta = document.querySelector('[data-results-meta]');

let allProducts = [];
let activeCategory = 'all';

const formatPrice = (value, currency = 'EUR') => {
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(value);
  } catch {
    return `€${value}`;
  }
};

const reviewLabel = (product) => {
  if (product.badge === 'Bestseller') return '4.9 ★ Bestseller';
  if (product.badge === 'Limited') return '4.8 ★ Limited edition';
  return '4.8 ★ Customer favorite';
};

const shippingLabel = 'Ships in 2–4 business days';

const renderCard = (product) => {
  const { id, name, price, currency, metal, style, image, badge, description, size } = product;
  const priceLabel = formatPrice(price, currency);
  const mainImage = Array.isArray(image) ? image[0] : image;

  return `
    <article class="product-card">
      <a href="product.html?id=${encodeURIComponent(id)}" aria-label="View ${name}">
        <div class="image-wrap">
          ${badge ? `<span class="badge">${badge}</span>` : ''}
          <img src="${mainImage}" alt="${name}" loading="lazy" decoding="async">
        </div>
        <div class="product-body">
          <div class="product-topline">
            <p class="product-name">${name}</p>
            <p class="price">${priceLabel}</p>
          </div>
          <p class="product-meta">${metal} • ${style} • ${size}</p>
          <p class="product-meta">${description}</p>
          <div class="rating-row">
            <span class="rating-pill">${reviewLabel(product)}</span>
            <span class="shipping-pill">${shippingLabel}</span>
          </div>
          <div class="price-row">
            <span class="chip">Multiple photos</span>
            <span class="chip">View details</span>
          </div>
        </div>
      </a>
    </article>
  `;
};

const updateResultsMeta = (count) => {
  if (!resultsMeta) return;
  resultsMeta.textContent = `${count} product${count === 1 ? '' : 's'} shown`;
};

const applyFilters = () => {
  const search = (searchInput?.value || '').trim().toLowerCase();
  const style = styleFilter?.value || 'all';
  const metal = metalFilter?.value || 'all';

  const filtered = allProducts.filter((product) => {
    const matchesSearch = !search || [
      product.name,
      product.description,
      product.style,
      product.metal,
      product.size,
      ...(product.details || [])
    ].join(' ').toLowerCase().includes(search);

    const matchesStyle = style === 'all' || product.style === style;
    const matchesMetal = metal === 'all' || product.metal === metal;
    const matchesCategory = activeCategory === 'all'
      || product.style === activeCategory
      || product.badge === activeCategory;

    return matchesSearch && matchesStyle && matchesMetal && matchesCategory;
  });

  renderProducts(filtered);
  updateResultsMeta(filtered.length);
};

const renderProducts = (products = []) => {
  if (!gridEl) return;

  if (!products.length) {
    gridEl.innerHTML = `
      <div class="product-card product-card--empty">
        <div class="product-body">
          <p class="product-name">No products match those filters.</p>
          <p class="product-meta">Try another search or choose a different category.</p>
        </div>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = products.map(renderCard).join('');
};

const showError = () => {
  if (!gridEl) return;
  gridEl.innerHTML = `
    <div class="product-card">
      <div class="product-body">
        <p class="product-name">We couldn’t load the collection right now.</p>
        <p class="product-meta">Please refresh and try again in a moment.</p>
      </div>
    </div>
  `;
};

const bindFilters = () => {
  searchInput?.addEventListener('input', applyFilters);
  styleFilter?.addEventListener('change', applyFilters);
  metalFilter?.addEventListener('change', applyFilters);

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.categoryFilter || 'all';
      categoryButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      applyFilters();
    });
  });
};

const loadProducts = async () => {
  try {
    const res = await fetch('data/products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    allProducts = await res.json();
    bindFilters();
    applyFilters();
  } catch (err) {
    console.error(err);
    showError();
  }
};

document.addEventListener('DOMContentLoaded', loadProducts);
