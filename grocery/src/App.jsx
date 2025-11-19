import React from 'react';
import Nav from './components/Nav'; 
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/Appcontext';
import Login from './components/Login';
import Allproducts from './pages/Allproducts';
import Productcategory from './pages/Productcategory';
import Productdetails from './pages/Productdetails';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import ProductList from './pages/seller/ProductList';
import AddProduct from './pages/seller/AddProduct';
import Orders from './pages/seller/Orders';
import AddAddress from './pages/AddAddress';
import Loading from './components/Loading';

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller} = useAppContext()
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
     {isSellerPath ? null : <Nav /> }
     {showUserLogin ? <Login/> : null }

     <Toaster />
      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Allproducts />} />
          <Route path='/products/:category' element={<Productcategory />} />
          <Route path='/products/:category/:id' element={<Productdetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/loader' element={<Loading />} />

          <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin/>}>
             <Route index element={isSeller ? <AddProduct /> : null } />
             <Route path='product-list' element={<ProductList /> } />
             <Route path='orders' element={<Orders /> } />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
}

export default App;
