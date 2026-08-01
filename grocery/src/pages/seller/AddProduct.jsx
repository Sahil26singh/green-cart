import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext.jsx';

const AddProduct = () => {
  const { axios, fetchProducts } = useAppContext();

  const [files,       setFiles]       = useState([]);
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [tags,        setTags]        = useState('');
  const [price,       setPrice]       = useState('');
  const [offerPrice,  setOfferPrice]  = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);

  const resetForm = () => {
    setName(''); setDescription(''); setCategory(''); setTags('');
    setPrice(''); setOfferPrice(''); setFiles([]);
  };

  const onGenerateHandler = async () => {
    if (!name.trim()) {
      toast.error('Enter a product name first');
      return;
    }
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (files[0]) formData.append('image', files[0]);

      const { data } = await axios.post('/api/product/generate', formData);

      if (data.success) {
        setDescription(data.description.join('\n'));
        if (data.category) setCategory(data.category);
        setTags(data.tags.join(', '));
        toast.success('AI suggestions added — feel free to edit them');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const productData = {
        name,
        description: description.split('\n').filter(Boolean), // remove blank lines
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        price:      Number(price),
        offerPrice: Number(offerPrice),
      };

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));
      files.forEach((file) => { if (file) formData.append('image', file); });

      const { data } = await axios.post('/api/product/add', formData);

      if (data.success) {
        toast.success(data.message);
        resetForm();
        // appears in ProductList and on the storefront without a page refresh ──
        await fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-700">Add New Product</h2>

        <div>
          <p className="text-base font-medium text-gray-700">Product Images</p>
          <p className="text-xs text-gray-400 mb-2">Upload up to 4 images. First image will be the thumbnail.</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4).fill('').map((_, index) => (
              <label
                key={index}
                htmlFor={`image${index}`}
                className="cursor-pointer group relative"
              >
                <input
                  id={`image${index}`}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const updated = [...files];
                    updated[index] = e.target.files[0];
                    setFiles(updated);
                  }}
                />
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300
                                group-hover:border-primary transition overflow-hidden flex items-center justify-center bg-gray-50">
                  {files[index] ? (
                    <img
                      src={URL.createObjectURL(files[index])}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={assets.upload_area}
                      alt="Upload area"
                      className="w-12 h-12 opacity-40 group-hover:opacity-60 transition"
                    />
                  )}
                </div>
                {index === 0 && (
                  <span className="absolute -bottom-4 left-0 text-[10px] text-primary font-medium">
                    Thumbnail
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md mt-6">
          <label htmlFor="product-name" className="text-sm font-medium text-gray-700">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="outline-none py-2.5 px-3 rounded-lg border border-gray-300
                       focus:border-primary transition text-sm"
            required
          />
        </div>

        <div className="max-w-md">
          <button
            type="button"
            onClick={onGenerateHandler}
            disabled={isGenerating || !name.trim()}
            className={`text-sm px-4 py-2 rounded-lg border font-medium transition
              ${isGenerating || !name.trim()
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-primary text-primary hover:bg-primary/10 cursor-pointer'
              }`}
          >
            {isGenerating ? 'Generating…' : ' Generate description, category & tags with AI'}
          </button>
          <p className="text-xs text-gray-400 mt-1">
          </p>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="product-description" className="text-sm font-medium text-gray-700">
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder={"Fresh and aromatic\nNo preservatives"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="outline-none py-2.5 px-3 rounded-lg border border-gray-300
                       focus:border-primary transition resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="outline-none py-2.5 px-3 rounded-lg border border-gray-300
                       focus:border-primary transition text-sm bg-white"
            required
          >
            <option value="">Select a category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>{item.path}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="product-tags" className="text-sm font-medium text-gray-700">
            Search Tags
          </label>
          <input
            id="product-tags"
            type="text"
            placeholder="e.g. breakfast, gluten-free, snack"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="outline-none py-2.5 px-3 rounded-lg border border-gray-300
                       focus:border-primary transition text-sm"
          />
        </div>

        <div className="flex items-start gap-4 max-w-md">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="product-price" className="text-sm font-medium text-gray-700">
              Original Price <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {import.meta.env.VITE_CURRENCY || '₹'}
              </span>
              <input
                id="product-price"
                type="number"
                min="0"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="outline-none py-2.5 pl-7 pr-3 w-full rounded-lg border border-gray-300
                           focus:border-primary transition text-sm"
                required
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="offer-price" className="text-sm font-medium text-gray-700">
              Offer Price <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {import.meta.env.VITE_CURRENCY || '₹'}
              </span>
              <input
                id="offer-price"
                type="number"
                min="0"
                placeholder="0"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="outline-none py-2.5 pl-7 pr-3 w-full rounded-lg border border-gray-300
                           focus:border-primary transition text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-lg font-medium text-white transition
              ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dull cursor-pointer'
              }`}
          >
            {isSubmitting ? 'Adding…' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-500
                       hover:bg-gray-50 transition cursor-pointer text-sm"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
