import React from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { categories } from "../assets/assets";
import Productcard from "../components/Productcard";

const Productcategory = () => {
  try {
    const { products = [] } = useAppContext() || {};
    const { category } = useParams();

    if (!category) {
      return (
        <div className="mt-16 text-center">
          <p className="text-lg">No category selected.</p>
        </div>
      );
    }

    const searchCategory = categories?.find(
      (item) => String(item.path || "").toLowerCase() === String(category).toLowerCase()
    );

    const filteredProducts = (products || []).filter(
      (product) => String(product.category || "").toLowerCase() === String(category).toLowerCase()
    );

    return (
      <div className="mt-16">
        {searchCategory && (
          <div className="flex flex-col items-end w-max">
            <div className="flex items-center gap-4">
              {searchCategory.image && (
                <img
                  src={searchCategory.image}
                  alt={searchCategory.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-semibold">{searchCategory.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {searchCategory.description}
                </p>
              </div>
            </div>
            <div className="w-16 h-0.5 bg-primary rounded-full" />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No products in this category.</p>
          ) : (
            filteredProducts
              .filter((p) => p && p.inStock) 
              .map((product, index) => (
                <Productcard key={product._id ?? index} product={product} />
              ))
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error rendering Productcategory:", err);
    return (
      <div className="mt-16 text-center">
        <p className="text-lg text-red-600">Something went wrong rendering this category.</p>
        <p className="text-sm text-gray-600 mt-2">Check console/terminal for details.</p>
      </div>
    );
  }
};

export default Productcategory;
