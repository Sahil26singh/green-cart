import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext.jsx';

const Cart = () => {
  const {
    axios,
    products,
    user,
    currency,
    cartItems, setCartItems,
    removeFromCart,
    updateCartItem,
    getCartCount,
    getCartAmount,
    navigate,
  } = useAppContext();

  const [cartArray,        setCartArray]        = useState([]);
  const [addresses,        setAddresses]        = useState([]);
  const [showAddress,      setShowAddress]      = useState(false);
  const [selectedAddress,  setSelectedAddress]  = useState(null);
  const [paymentOption,    setPaymentOption]    = useState('COD');

  const buildCartArray = () => {
    const temp = [];
    for (const id in cartItems) {
      const product = products.find((p) => String(p._id) === String(id));
      if (product) temp.push({ ...product, quantity: cartItems[id] });
    }
    setCartArray(temp);
  };

  const getUserAddresses = async () => {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const placeOrder = async () => {
    try {
      if (!selectedAddress) return toast.error('Please select an address');

      const items = cartArray.map((item) => ({ product: item._id, quantity: item.quantity }));
      const payload = { userId: user._id, items, address: selectedAddress._id };

      if (paymentOption === 'COD') {
        const { data } = await axios.post('/api/order/cod', payload);
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate('/my-orders');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post('/api/order/stripe', payload);
        if (data.success) {
          setCartItems({});
          window.location.replace(data.url);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) buildCartArray();
  }, [products, cartItems]);

  useEffect(() => {
    if (user) getUserAddresses();
  }, [user]);

  if (!products.length || !cartItems) return null;

  return (
    <div className="flex flex-col md:flex-row mt-16">

      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{' '}
          <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={product._id ?? index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  const cat = Array.isArray(product.category)
                    ? product.category[0]
                    : product.category;
                  navigate(`/products/${encodeURIComponent(String(cat).trim().toLowerCase())}/${product._id}`);
                  window.scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>Weight: <span>{product.weight || 'N/A'}</span></p>
                  <div className="flex items-center gap-1">
                    <p>Qty:</p>
                    <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                        value={cartItems[product._id]} className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9 ).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                  </div>
                </div>
              </div>
            </div>


            <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>

            <button
              onClick={() => {
                const updated = { ...cartItems };
                delete updated[product._id];
                setCartItems(updated);
              }}
              className="cursor-pointer mx-auto"
            >
              <img src={assets.remove_icon} alt="remove" className="w-6 h-6" />
            </button>
          </div>
        ))}

        <button
          onClick={() => { navigate('/products'); window.scrollTo(0, 0); }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium"
        >
          <img src={assets.arrow_right_icon_colored} alt="back" className="group-hover:-translate-x-1 transition" />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        {/* Address selector */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : 'No address found'}
            </p>
            <button
              onClick={() => setShowAddress((prev) => !prev)}
              className="text-primary hover:underline cursor-pointer"
            >
              Change
            </button>

            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {addresses.map((addr, i) => (
                  <p
                    key={addr._id ?? i}
                    onClick={() => { setSelectedAddress(addr); setShowAddress(false); }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {addr.street}, {addr.city}, {addr.state}, {addr.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate('/add-address')}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10"
                >
                  + Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (5%)</span>
            <span>{currency}{(getCartAmount() * 0.05).toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>{currency}{(getCartAmount() * 1.05).toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition"
        >
          {paymentOption === 'COD' ? 'Place Order' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
