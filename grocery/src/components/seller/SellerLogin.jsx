import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext.jsx';

const SellerLogin = () => {
  const { axios, isSeller, setIsSeller, navigate } = useAppContext();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (isSeller) navigate('/seller');
  }, [isSeller]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post('/api/seller/login', {
        email: email.trim(),
        password,
      });
      if (data?.success) {
        setIsSeller(true);
        navigate('/seller');
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSeller) return null;

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center text-sm text-gray-600"
    >
      <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Seller</span> Login
        </p>

        <div className="w-full">
          <label className="block text-xs font-medium" htmlFor="seller-email">Email</label>
          <input
            id="seller-email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="admin@example.com"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            aria-label="seller email"
          />
        </div>

        <div className="w-full">
          <label className="block text-xs font-medium" htmlFor="seller-password">Password</label>
          <input
            id="seller-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="12345"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
            aria-label="seller password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-primary text-white w-full py-2 rounded-md ${
            loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-primary-dull transition'
          }`}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </div>
    </form>
  );
};

export default SellerLogin;
