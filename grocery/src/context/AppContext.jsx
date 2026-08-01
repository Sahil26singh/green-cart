import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Axios Global Defaults ────────────────────────────────────────────────────
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ─── LocalStorage flag helpers ────────────────────────────────────────────────
// We never store the token (that lives in an httpOnly cookie, unreachable from JS).
// We only store a simple boolean hint so we know whether it's even worth making
// the is-auth request on startup. This eliminates the noisy 401 errors in the
// console for visitors who are not logged in at all.

const FLAGS = {
  user:   'gc_user_logged_in',
  seller: 'gc_seller_logged_in',
};

const setFlag   = (key)    => localStorage.setItem(key, '1');
const clearFlag = (key)    => localStorage.removeItem(key);
const hasFlag   = (key)    => localStorage.getItem(key) === '1';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate  = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [user,          setUser]          = useState(null);
  const [isSeller,      setIsSeller]      = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products,      setProducts]      = useState([]);
  const [cartItems,     setCartItems]     = useState({});
  const [searchQuery,   setSearchQuery]   = useState('');
  const [isUserFetched, setIsUserFetched] = useState(false);

  const cartSyncTimer = useRef(null);
  
const isSellerRef   = useRef(false);
useEffect(() => { isSellerRef.current = isSeller; }, [isSeller]);

const isUserRef = useRef(false);
useEffect(() => { isUserRef.current = !!user; }, [user]);


useEffect(() => {
  const interceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && isSellerRef.current) {
        clearFlag(FLAGS.seller);
        setIsSeller(false);
        error.silent = true;
      }
      return Promise.reject(error);
    }
  );
  return () => axios.interceptors.response.eject(interceptorId);
}, []);


  const fetchSeller = async () => {

    if (!hasFlag(FLAGS.seller)) return;

    try {
      const { data } = await axios.get('/api/seller/is-auth');
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
        clearFlag(FLAGS.seller);
      }
    } catch {
      setIsSeller(false);
      clearFlag(FLAGS.seller);
    }
  };

  const fetchUser = async () => {
    if (!hasFlag(FLAGS.user)) {
      setIsUserFetched(true);
      return;
    }

    try {
      const { data } = await axios.get('/api/user/is-auth');
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems ?? {});
      } else {
        setUser(null);
        clearFlag(FLAGS.user);
      }
    } catch {
      setUser(null);
      clearFlag(FLAGS.user);
    } finally {
      setIsUserFetched(true);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleSetUser = (userData) => {
    if (userData) {
      setFlag(FLAGS.user);
    } else {
      clearFlag(FLAGS.user);
    }
    setUser(userData);
  };

  const handleSetIsSeller = (value) => {
    if (value) {
      setFlag(FLAGS.seller);
    } else {
      clearFlag(FLAGS.seller);
    }
    setIsSeller(value);
  };

  const addToCart = (itemId) => {
    const updated = structuredClone(cartItems);
    updated[itemId] = (updated[itemId] || 0) + 1;
    setCartItems(updated);
    toast.success('Added to cart');
  };

  const updateCartItem = (itemId, quantity) => {
    const updated = structuredClone(cartItems);
    updated[itemId] = quantity;
    setCartItems(updated);
    toast.success('Cart updated');
  };

  const removeFromCart = (itemId) => {
    const updated = structuredClone(cartItems);
    if (updated[itemId]) {
      updated[itemId] -= 1;
      if (updated[itemId] === 0) delete updated[itemId];
    }
    setCartItems(updated);
    toast.success('Removed from cart');
  };


  const getCartCount = () =>
    Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product && cartItems[id] > 0) {
        total += product.offerPrice * cartItems[id];
      }
    }
    return Math.floor(total * 100) / 100;
  };


  useEffect(() => {
    fetchSeller();
    fetchProducts();
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);

    cartSyncTimer.current = setTimeout(async () => {
      try {
        const { data } = await axios.post('/api/cart/update', { cartItems });
        if (!data.success) toast.error(data.message);
      } catch {
        toast.error('Cart sync failed — changes may not be saved');
      }
    }, 800);

    return () => { if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current); };
  }, [cartItems]); 


  const value = {
    navigate, axios, currency,

    user,
    setUser: handleSetUser,
    isSeller,
    setIsSeller: handleSetIsSeller,
    showUserLogin, setShowUserLogin,
    // Products
    products, fetchProducts,
    // Cart
    cartItems, setCartItems,
    addToCart, updateCartItem, removeFromCart,
    getCartCount, getCartAmount,
    // Search
    searchQuery, setSearchQuery,
    isUserFetched,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
