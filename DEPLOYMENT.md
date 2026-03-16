# Ahalya Tex - Deployment Guide

## 🚀 Complete Deployment Setup

### Backend (Render) & Frontend (Vercel)

---

## 📋 Backend Deployment (Render)

### 1. Render Configuration
- **Service Type**: Web Service
- **Name**: ahalya-tex-backend
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/`

### 2. Environment Variables (Render Dashboard)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://DHARANYAA:11-Nov-05@cluster1.2e8qe.mongodb.net/ahalya_tex?retryWrites=true&w=majority
JWT_SECRET=ahalya_tex_jwt_secret_key_2024_secure_token
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

### 3. Create Admin User
After deployment, run:
```bash
cd backend && node scripts/seedAdmin.js
```

---

## 📋 Frontend Deployment (Vercel)

### 1. Vercel Configuration
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2. Environment Variables (Vercel Dashboard)
```bash
VITE_API_URL=https://ahalya-tex-2.onrender.com
```

### 3. Vercel Settings
- **Custom Domain**: Optional (e.g., ahalya-tex.vercel.app)
- **Node Version**: 18.x or higher
- **Build Cache**: Enabled

---

## 🔧 API Configuration

### Frontend API URLs
Update frontend to use production API:

```javascript
// In API calls, use:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### CORS Configuration
Backend already configured for Vercel origin:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://ahalya-tex.vercel.app'],
  credentials: true
}));
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Connect GitHub: `Dharanya11/Ahalya_tex`
4. Configure as above
5. Click "Create Web Service"

### Step 2: Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect GitHub: `Dharanya11/Ahalya_tex`
4. Select `frontend` directory
5. Configure as above
6. Click "Deploy"

### Step 3: Create Admin User
1. After backend is deployed, access Render shell
2. Run: `cd backend && node scripts/seedAdmin.js`
3. Admin credentials: `admin@example.com` / `admin123`

---

## 📱 Final URLs

After deployment:
- **Frontend**: `https://ahalya-tex.vercel.app`
- **Backend**: `https://ahalya-tex-2.onrender.com`
- **API Docs**: `https://ahalya-tex-2.onrender.com/`

---

## 🔍 Testing

### 1. Backend Health Check
```bash
curl https://ahalya-tex-2.onrender.com/
# Should return: "API is running..."
```

### 2. Admin Login Test
- Email: `admin@example.com`
- Password: `admin123`

### 3. User Registration Test
- Create a new user account
- Verify login works

### 4. Payment Flow Test
- Add products to cart
- Test checkout with dummy payment

---

## 🛠️ Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS origins
2. **Database Connection**: Check MongoDB URI
3. **Environment Variables**: Verify all required vars are set
4. **Build Failures**: Check package.json scripts

### Render Specific
- Use `cd backend && npm install` as build command
- Set proper root directory
- Check health check path

### Vercel Specific
- Ensure build output is `dist` directory
- Check environment variable names (VITE_ prefix)
- Verify base path in vite.config.js

---

## 📞 Support

For deployment issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Verify environment variables
4. Test API endpoints individually

---

**Your Ahalya Tex website is now ready for production deployment!** 🎉
