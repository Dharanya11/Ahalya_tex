import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import PaymentTestPage from "./pages/PaymentTestPage";
import SimplePaymentPage from "./pages/SimplePaymentPage";
import DesignYourBag from "./components/DesignYourBag";
import DesignYourCarpet from "./components/DesignYourCarpet";
import DesignYourBedsheet from "./components/DesignYourBedsheet";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ReturnPolicy from "./components/ReturnPolicy";
import FAQ from "./components/FAQ";
import CustomizableCategories from "./pages/CustomizableCategories";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminAuth from "./pages/AdminAuth.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminManageUsers from "./pages/AdminManageUsers.jsx";
import UserRoute from "./components/UserRoute.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import LocalDelivery from "./pages/LocalDelivery.jsx";
import PaymentTest from "./components/PaymentTest.jsx";
import "./style.css";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-test" element={<PaymentTest />} />
        <Route path="/payment-test-page" element={<PaymentTestPage />} />
        <Route path="/simple-payment" element={<SimplePaymentPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<UserRoute><MyOrders /></UserRoute>} />
        <Route path="/orders/:id" element={<UserRoute><OrderDetails /></UserRoute>} />
        <Route path="/local-delivery" element={<LocalDelivery />} />
        <Route path="/design-bag" element={<DesignYourBag />} />
        <Route path="/design-carpet" element={<DesignYourCarpet />} />
        <Route path="/design-bedsheet" element={<DesignYourBedsheet />} />
        <Route path="/customizable-categories" element={<CustomizableCategories />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminAuth />} />
        {/* Admin routes - protected; only role "admin" can access */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminManageUsers /></AdminRoute>} />
        <Route path="/user/home" element={<Home />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/customer/dashboard" element={<UserRoute><CustomerDashboard /></UserRoute>} />
        {/* Legacy routes for backward compatibility */}
        <Route path="/shop" element={<CategoryPage />} />
        <Route path="/bedsheets" element={<CategoryPage />} />
      </Routes>
    </>
  );
}

export default App;
