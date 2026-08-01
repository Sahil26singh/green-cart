import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import Productcard from './Productcard';

const Bestseller = () => {
  const { products } = useAppContext();

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {products
          .filter((p) => p.inStock)
          .slice(0, 5)
          .map((product, index) => (
            <Productcard key={product._id ?? index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default Bestseller;
