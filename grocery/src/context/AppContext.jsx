import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {dummyProducts} from "../assets/assets"
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  const fetchSeller = async ()=>{
    try {
      const {data} = await axios.get('/api/seller/is-auth');
      if(data.success){
        setIsSeller(true);
      }else{
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  }

  const fetchUser = async()=>{
    try {
      const {data} = await axios.get('/api/user/is-auth');
      if(data.success){
        setUser(data.user)
        setCartItems(data.user.cartItems)
      }
    } catch (error) {
      setUser(null)
    }
  }

  const fetchProducts = async () => {
    try {
      const {data} = await axios.get('/api/product/list')
      if(data.success){
        setProducts(data.products)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addToCart = (itemId)=>{
    let cartdata = structuredClone(cartItems);
    if(cartdata[itemId]){
      cartdata[itemId] += 1;
    }else{
      cartdata[itemId] = 1;
    }
    setCartItems(cartdata);
    toast.success("added to cart")
  }

  const updateCartItem =(itemId, quantity)=>{
    let cartdata = structuredClone(cartItems);
    cartdata[itemId] = quantity;
    setCartItems(cartdata);
    toast.success("cart updated")
  }

  const removeFromCart = (itemId)=>{
    let cartdata = structuredClone(cartItems);
    if(cartdata[itemId]){
      cartdata[itemId] -= 1;
      if(cartdata[itemId] === 0){
        delete cartdata[itemId];
      }
    }
    toast.success("removed from cart");
    setCartItems(cartdata);
  }

  // cart item count
  const getCartCount = ()=>{
    let totalcount=0;
    for(const item in cartItems){
      totalcount += cartItems[item];
    }
    return totalcount;
  }

  // cart amount count
  const getCartAmount = ()=>{
    let totalamount = 0;
    for(const items in cartItems){
      let iteminfo = products.find((product)=> product._id === items);
      if(cartItems[items] > 0){
        totalamount += iteminfo.offerPrice * cartItems[items]
      }
    }
    return Math.floor(totalamount*100)/100;
  }

  useEffect(()=>{
    fetchSeller()
    fetchProducts()
    fetchUser()
  },[])

  useEffect(()=>{
    const updateCart = async ()=>{
      try {
        const {data} = await axios.post('/api/cart/update',{cartItems})
        if(!data.success){
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
    if(user){
      updateCart()
    }
  },[cartItems])

  const value = { navigate, user, setUser, setIsSeller, isSeller , showUserLogin, setShowUserLogin, 
    products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery,
     setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, setCartItems};

  return (
    <AppContext.Provider value={value}>
      {children} 
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
