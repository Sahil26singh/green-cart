import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const Loading = () => {
  const { navigate, setCartItems, axios } = useAppContext();
  const { search } = useLocation();

  const params    = new URLSearchParams(search);
  const nextUrl   = params.get('next');
  const sessionId = params.get('session_id');

  useEffect(() => {
    if (!nextUrl) return;

    const confirmAndRedirect = async () => {
      if (sessionId) {
        try {
          await axios.get(`/api/order/verify-stripe?session_id=${sessionId}`);
        } catch {
          // Non-fatal — the webhook (if configured) still confirms it eventually.
        }
      }
      setCartItems({});
      navigate(`/${nextUrl}`);
    };

    const timer = setTimeout(confirmAndRedirect, 1500);
    return () => clearTimeout(timer);
  }, [nextUrl, sessionId]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary" />
    </div>
  );
};

export default Loading;