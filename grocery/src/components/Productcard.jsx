import React from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext.jsx';

const Productcard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  if (!product) return null;

  const handleCardClick = () => {
    const category = Array.isArray(product.category) ? product.category[0] : product.category;
    if (category && product._id) {
      navigate(
        `/products/${encodeURIComponent(String(category).trim().toLowerCase())}/${encodeURIComponent(product._id)}`
      );
      window.scrollTo(0, 0);
    } else {
      navigate('/products');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="border border-gray-500/20 rounded-xl md:px-4 px-3 py-3 bg-white cursor-pointer
                 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ minWidth: 0 }} 
    >

      <div className="w-full h-36 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50 mb-2">
        <img
          className="max-h-full max-w-full object-contain
                     group-hover:scale-105 transition-transform duration-300"
          src={product.image[0]}
          alt={product.name}
        />
      </div>

      <div className="flex flex-col flex-1 text-sm">
        <p className="text-gray-400 text-xs mb-0.5">{product.category}</p>

        <p className="text-gray-800 font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>

        <div className="flex items-center gap-0.5 mt-1">
          {Array(5).fill('').map((_, i) => (
            <img
              key={i}
              className="w-3.5 md:w-3.5"
              src={i < 4 ? assets.star_icon : assets.star_dull_icon}
              alt="star"
            />
          ))}
          <p className="text-gray-400 text-xs ml-1">(4)</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <p className="text-primary font-bold text-base">
              {currency}{product.offerPrice}
            </p>
            <p className="text-gray-400 text-xs line-through">
              {currency}{product.price}
            </p>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {!cartItems[product._id] ? (
              <button
                onClick={() => addToCart(product._id)}
                className="flex items-center justify-center gap-1.5 border-2 border-primary
                           w-[72px] h-[34px] rounded-lg text-primary text-sm font-semibold
                           hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
              >
                <img src={assets.cart_icon} alt="cart" className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-1 w-[72px] h-[34px]
                            bg-primary rounded-lg text-white select-none"
              >
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer font-bold text-lg px-2 h-full hover:opacity-80 transition"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer font-bold text-lg px-2 h-full hover:opacity-80 transition"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productcard;
