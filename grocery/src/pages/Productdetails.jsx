import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext.jsx';
import Productcard from '../components/Productcard';

const Productdetails = () => {
  const { products, currency, addToCart, navigate } = useAppContext();
  const { category, id } = useParams();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail,       setThumbnail]       = useState(null);

  const product = products.find((item) => item._id === id);

  useEffect(() => {
    if (!product) { setRelatedProducts([]); return; }
    const related = products
      .filter((p) => p.category === product.category && p._id !== product._id)
      .slice(0, 5);
    setRelatedProducts(related);
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image?.[0] ?? null);
  }, [product]);

  if (!product) {
    return (
      <div className="mt-12 text-center">
        <p className="text-lg">Product not found.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 border rounded"
        >
          Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12">

      <p className="text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Home</Link> /{' '}
        <Link to="/products" className="hover:text-primary">Products</Link> /{' '}
        <Link to={`/products/${(Array.isArray(product.category) ? product.category[0] : product.category).toLowerCase()}`} className="hover:text-primary">
          {Array.isArray(product.category) ? product.category[0] : product.category}
        </Link>{' '}
        / <span className="text-primary">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">

        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.image?.map((img, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(img)}
                className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
<div className="border border-gray-500/30 w-72 h-72 rounded overflow-hidden">
  {thumbnail ? (
    <img
      src={thumbnail}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
      No image
    </div>
  )}
</div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          <div className="flex items-center gap-0.5 mt-1">
            {Array(5).fill('').map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="md:w-4 w-3.5"
              />
            ))}
            <p className="text-base ml-2">(4)</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
            <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice}</p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70">
            {product.description?.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => { addToCart(product._id); navigate('/cart'); }}
              className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max">
          <p className="text-3xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6 w-full">
          {relatedProducts
            .filter((p) => p.inStock)
            .map((prod, index) => (
              <Productcard key={prod._id ?? index} product={prod} />
            ))}
        </div>

        <button
          onClick={() => { navigate('/products'); window.scrollTo(0, 0); }}
          className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default Productdetails;
