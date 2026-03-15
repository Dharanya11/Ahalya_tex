/* global window, document */

const API_BASE = '/api/reviews';

const els = {
  form: document.getElementById('reviewForm'),
  submitBtn: document.getElementById('submitBtn'),
  resetBtn: document.getElementById('resetBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  toast: document.getElementById('toast'),
  loading: document.getElementById('loading'),
  empty: document.getElementById('empty'),
  reviews: document.getElementById('reviews'),
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  rating: document.getElementById('rating'),
  message: document.getElementById('message'),
  ratingHint: document.getElementById('ratingHint'),
  avgRating: document.getElementById('avgRating'),
  avgStars: document.getElementById('avgStars'),
  avgMeta: document.getElementById('avgMeta'),
  stars: Array.from(document.querySelectorAll('.star-input .star')),
};

function setToast(text) {
  els.toast.textContent = text || '';
}

function setFieldError(field, message) {
  const el = document.querySelector(`[data-error-for="${field}"]`);
  if (el) el.textContent = message || '';
}

function clearErrors() {
  setFieldError('name', '');
  setFieldError('email', '');
  setFieldError('rating', '');
  setFieldError('message', '');
}

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function clampRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 5) return null;
  return n;
}

function renderStars(container, value) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.round(v);
  const out = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  container.textContent = out;
  container.style.color = '#f59e0b';
  container.style.letterSpacing = '2px';
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '';
  }
}

function setStarSelection(rating) {
  const r = clampRating(rating);
  els.stars.forEach((btn) => {
    const v = Number(btn.dataset.value);
    if (r && v <= r) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  if (!r) {
    els.ratingHint.textContent = 'Click stars to rate';
  } else {
    els.ratingHint.textContent = `Selected: ${r} / 5`;
  }
}

async function fetchReviews() {
  els.loading.hidden = false;
  els.empty.hidden = true;
  els.reviews.innerHTML = '';

  try {
    const res = await fetch(API_BASE, { method: 'GET' });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Failed to load reviews (HTTP ${res.status})`);
    }

    const data = await res.json();
    const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
    const avg = Number(data?.averageRating || 0);

    els.avgRating.textContent = avg.toFixed(1);
    renderStars(els.avgStars, avg);
    els.avgMeta.textContent = `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;

    if (!reviews.length) {
      els.empty.hidden = false;
      return;
    }

    reviews.forEach((r) => {
      const card = document.createElement('article');
      card.className = 'review';

      const top = document.createElement('div');
      top.className = 'review-top';

      const left = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'review-name';
      name.textContent = r.name || 'Anonymous';

      const email = document.createElement('div');
      email.className = 'review-email';
      email.textContent = r.email || '';

      left.appendChild(name);
      left.appendChild(email);

      const right = document.createElement('div');
      const stars = document.createElement('div');
      stars.className = 'review-stars';
      stars.textContent = '★★★★★'.slice(0, Number(r.rating || 0)) + '☆☆☆☆☆'.slice(0, 5 - Number(r.rating || 0));

      const date = document.createElement('div');
      date.className = 'review-date';
      date.textContent = formatDate(r.createdAt);

      right.appendChild(stars);
      right.appendChild(date);

      top.appendChild(left);
      top.appendChild(right);

      const msg = document.createElement('div');
      msg.className = 'review-message';
      msg.textContent = r.message || '';

      card.appendChild(top);
      card.appendChild(msg);

      els.reviews.appendChild(card);
    });
  } catch (err) {
    els.empty.hidden = false;
    setToast(err?.message || 'Failed to load reviews');
  } finally {
    els.loading.hidden = true;
  }
}

function validateForm() {
  clearErrors();
  let ok = true;

  const name = els.name.value.trim();
  const email = els.email.value.trim();
  const rating = clampRating(els.rating.value);
  const message = els.message.value.trim();

  if (!name) {
    ok = false;
    setFieldError('name', 'Name is required');
  }

  if (!email || !isValidEmail(email)) {
    ok = false;
    setFieldError('email', 'Valid email is required');
  }

  if (!rating) {
    ok = false;
    setFieldError('rating', 'Please select a rating (1–5)');
  }

  if (!message) {
    ok = false;
    setFieldError('message', 'Review message is required');
  }

  return ok;
}

async function submitReview() {
  if (!validateForm()) return;

  const payload = {
    name: els.name.value.trim(),
    email: els.email.value.trim(),
    rating: Number(els.rating.value),
    message: els.message.value.trim(),
  };

  setToast('Submitting...');
  els.submitBtn.disabled = true;

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text();
      let msg = raw;
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        msg = parsed?.message || raw;
      } catch {
        // ignore
      }
      throw new Error(msg || `Failed to submit review (HTTP ${res.status})`);
    }

    setToast('Thanks! Your review has been submitted.');
    els.form.reset();
    els.rating.value = '';
    setStarSelection(null);

    await fetchReviews();
  } catch (err) {
    setToast(err?.message || 'Failed to submit review');
  } finally {
    els.submitBtn.disabled = false;
  }
}

function initStarUI() {
  els.stars.forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = Number(btn.dataset.value);
      els.rating.value = String(v);
      setStarSelection(v);
      setFieldError('rating', '');
    });
  });

  setStarSelection(null);
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  submitReview();
});

els.resetBtn.addEventListener('click', () => {
  els.form.reset();
  els.rating.value = '';
  clearErrors();
  setStarSelection(null);
  setToast('');
});

els.refreshBtn.addEventListener('click', () => {
  setToast('');
  fetchReviews();
});

initStarUI();
fetchReviews();
