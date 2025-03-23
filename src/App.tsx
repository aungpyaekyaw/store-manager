import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Shop from './pages/Shop';
import Items from './pages/Items';
import Categories from './pages/Categories';
import ShopSettings from './pages/ShopSettings';
import PublicShop from './pages/PublicShop';
import PublicItemDetail from './pages/PublicItemDetail';
import Orders from './pages/Orders';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/settings" element={<ShopSettings />} />
          <Route path="/items" element={<Items />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/shops/:shopId" element={<PublicShop />} />
          <Route path="/shops/:shopId/items/:itemId" element={<PublicItemDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
