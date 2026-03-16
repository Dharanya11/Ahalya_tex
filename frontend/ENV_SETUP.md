# 🚀 Frontend Environment Variables Setup

## 📋 Required Environment Variables for Vercel

### 🔧 **Vercel Dashboard Configuration**

Go to your Vercel project → **Settings** → **Environment Variables** and add these:

---

### **🌐 API Configuration**
```
VITE_API_URL=https://ahalya-tex-2.onrender.com
```
**Purpose**: Backend API URL for all frontend requests

---

### **💳 Payment Configuration**
```
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
```
**Purpose**: Razorpay payment gateway key

---

### **📱 Application Settings**
```
VITE_APP_NAME=Ahalya Textile
VITE_APP_VERSION=1.0.0
VITE_ENABLE_NOTIFICATIONS=true
```
**Purpose**: Application metadata and feature flags

---

### **📞 Contact Information**
```
VITE_SUPPORT_EMAIL=support@ahalyatex.com
VITE_PHONE_NUMBER=+919876543210
```
**Purpose**: Customer support contact details

---

### **🔗 Social Media Links**
```
VITE_FACEBOOK_URL=https://facebook.com/ahalyatex
VITE_INSTAGRAM_URL=https://instagram.com/ahalyatex
VITE_TWITTER_URL=https://twitter.com/ahalyatex
```
**Purpose**: Social media links for footer

---

## 🖥️ **Local Development Setup**

### **Step 1: Create .env.local**
Create `.env.local` in frontend directory (this file is gitignored):

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Development Settings
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true

# Payment (use test keys for development)
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag

# Application Settings
VITE_APP_NAME=Ahalya Textile (Dev)
VITE_ENABLE_NOTIFICATIONS=true
```

### **Step 2: Install and Run**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 **How to Use Environment Variables in Code**

### **Import Pattern:**
```javascript
// In any component
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const enableNotifications = import.meta.env.VITE_ENABLE_NOTIFICATIONS;
```

### **Example Usage:**
```javascript
// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Feature Flags
const enableNotifications = import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true';

// App Metadata
const appName = import.meta.env.VITE_APP_NAME || 'Ahalya Textile';
```

---

## 🚀 **Vercel Deployment Steps**

### **1. Go to Vercel Dashboard**
- Visit [vercel.com/dashboard](https://vercel.com/dashboard)
- Select your `ahalya-tex-rcg3` project

### **2. Add Environment Variables**
- Click **"Settings"** → **"Environment Variables"**
- Add each variable from the list above
- Make sure to set **VITE_API_URL** to your backend URL

### **3. Redeploy**
- Click **"Redeploy"** to apply environment variables
- Wait for deployment to complete

---

## 🔧 **Environment Variable Reference**

| Variable | Required | Default | Description |
|-----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | `http://localhost:5000` | Backend API URL |
| `VITE_RAZORPAY_KEY_ID` | ✅ Yes | - | Razorpay payment key |
| `VITE_APP_NAME` | ❌ No | `Ahalya Textile` | Application name |
| `VITE_ENABLE_NOTIFICATIONS` | ❌ No | `true` | Enable notifications |
| `VITE_SUPPORT_EMAIL` | ❌ No | - | Customer support email |
| `VITE_PHONE_NUMBER` | ❌ No | - | Customer support phone |

---

## 🐛 **Troubleshooting**

### **Environment Variables Not Working:**
1. **Check prefix**: All Vite env vars must start with `VITE_`
2. **Restart server**: After changing .env.local, restart dev server
3. **Vercel redeploy**: Environment changes require redeploy
4. **Check console**: Look for undefined variable errors

### **API Connection Issues:**
1. **Verify VITE_API_URL**: Make sure it points to correct backend
2. **Check CORS**: Backend should allow your Vercel domain
3. **Test backend**: Ensure backend is running and accessible

---

## 📱 **Production vs Development**

### **Development (.env.local):**
```bash
VITE_API_URL=http://localhost:5000
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
```

### **Production (Vercel):**
```bash
VITE_API_URL=https://ahalya-tex-2.onrender.com
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

---

## ✅ **Verification**

After setup, verify environment variables are working:

### **In Browser Console:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('App Name:', import.meta.env.VITE_APP_NAME);
```

### **Expected Output:**
```
API URL: https://ahalya-tex-2.onrender.com
App Name: Ahalya Textile
```

---

**🎉 Your frontend environment variables are now properly configured!**

Set these in Vercel dashboard and your application will work perfectly in production! 🚀
