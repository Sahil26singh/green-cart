import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import Productcard from '../components/Productcard';

const Allproducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {filteredProducts
          .filter((p) => p.inStock)
          .map((product, index) => (
            <Productcard key={product._id ?? index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default Allproducts;
