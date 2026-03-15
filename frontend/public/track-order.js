/* global window, document */

const API_BASE = '/api/tracking';
const REFRESH_MS = 12000;

const els = {
  trackingInput: document.getElementById('trackingInput'),
  trackBtn: document.getElementById('trackBtn'),
  error: document.getElementById('error'),
  loading: document.getElementById('loading'),
  summary: document.getElementById('summary'),
  status: document.getElementById('status'),
  eta: document.getElementById('eta'),
  trackingNumber: document.getElementById('trackingNumber'),
  orderId: document.getElementById('orderId'),
  updatedAt: document.getElementById('updatedAt'),
  lastLocation: document.getElementById('lastLocation'),
  steps: Array.from(document.querySelectorAll('.step')),
};

let refreshTimer = null;
let lastTrackingNumber = null;

function setError(msg) {
  els.error.textContent = msg || '';
}

function setLoading(isLoading) {
  els.loading.hidden = !isLoading;
  els.trackBtn.disabled = !!isLoading;
}

function isValidTrackingNumber(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  return /^[A-Z0-9-]{6,40}$/i.test(v);
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '—';
  }
}

function getStepIndex(status) {
  const steps = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const s = String(status || '').trim();
  const idx = steps.indexOf(s);
  if (idx >= 0) return idx;
  // Map older/backend statuses
  if (s === 'Confirmed') return 1;
  return 0;
}

function renderSteps(status) {
  const idx = getStepIndex(status);
  els.steps.forEach((el) => {
    const step = el.getAttribute('data-step');
    const stepIdx = getStepIndex(step);
    el.classList.remove('done', 'current');
    if (stepIdx < idx) el.classList.add('done');
    if (stepIdx === idx) el.classList.add('current');
    if (stepIdx === idx && idx === 0) el.classList.add('current');
    if (stepIdx <= idx && idx > 0) el.classList.add('done');
    if (stepIdx === idx) {
      el.classList.add('current');
    }
  });
}

function applyTrackingData(data) {
  els.summary.hidden = false;

  els.trackingNumber.textContent = data.trackingNumber || '—';
  els.orderId.textContent = data.orderId || '—';
  els.status.textContent = data.orderStatus || '—';
  els.eta.textContent = formatDate(data.estimatedDelivery);
  els.updatedAt.textContent = formatDateTime(data.lastUpdatedAt || data?.agent?.updatedAt);
  els.lastLocation.textContent = data.lastLocation || '—';

  renderSteps(data.orderStatus);
}

async function fetchTracking(trackingNumber) {
  setLoading(true);
  setError('');

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(trackingNumber)}`, { method: 'GET' });

    if (!res.ok) {
      const raw = await res.text();
      let msg = raw;
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        msg = parsed?.message || raw;
      } catch {
        // ignore
      }
      if (res.status === 404) {
        throw new Error('We couldn’t find that tracking number. Please check and try again.');
      }
      throw new Error(msg || `Failed to fetch tracking (HTTP ${res.status})`);
    }

    const data = await res.json();
    applyTrackingData(data);
    return true;
  } catch (err) {
    els.summary.hidden = true;
    setError(err?.message || 'Unable to track this order right now.');
    return false;
  } finally {
    setLoading(false);
  }
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function startAutoRefresh(trackingNumber) {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    fetchTracking(trackingNumber);
  }, REFRESH_MS);
}

async function handleTrack() {
  const trackingNumber = els.trackingInput.value.trim();

  if (!isValidTrackingNumber(trackingNumber)) {
    setError('Please enter a valid tracking number (letters/numbers and dashes only).');
    return;
  }

  lastTrackingNumber = trackingNumber;

  const ok = await fetchTracking(trackingNumber);
  if (ok) startAutoRefresh(trackingNumber);
}

els.trackBtn.addEventListener('click', handleTrack);
els.trackingInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleTrack();
  }
});

// Cleanup refresh when leaving page
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});
