import React from 'react';
import { useParams } from 'react-router-dom';

import { categories } from '../assets/assets';
import { useAppContext } from '../context/AppContext.jsx';
import Productcard from '../components/Productcard';

const Productcategory = () => {
  const { products = [] } = useAppContext();
  const { category } = useParams();

  if (!category) {
    return (
      <div className="mt-16 text-center">
        <p className="text-lg">No category selected.</p>
      </div>
    );
  }

  const categoryMeta = categories?.find(
    (item) => item.path.toLowerCase() === category.toLowerCase()
  );

  const filteredProducts = products.filter(
    (p) => p.category?.toLowerCase() === category.toLowerCase() && p.inStock
  );

  return (
    <div className="mt-16">
      {categoryMeta && (
        <div className="flex flex-col items-end w-max">
          <div className="flex items-center gap-4">
            {categoryMeta.image && (
              <img
                src={categoryMeta.image}
                alt={categoryMeta.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-semibold">{categoryMeta.title}</h2>
              {categoryMeta.description && (
                <p className="text-sm text-gray-500">{categoryMeta.description}</p>
              )}
            </div>
          </div>
          <div className="w-16 h-0.5 bg-primary rounded-full mt-2" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No products in this category.
          </p>
        ) : (
          filteredProducts.map((product, index) => (
            <Productcard key={product._id ?? index} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Productcategory;
