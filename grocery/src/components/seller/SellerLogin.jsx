import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/Appcontext'
import toast from 'react-hot-toast'
import axios from 'axios';

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext()
  // default values prefilled in the form
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("greencart123")
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const payload = { email: email.trim(), password }
      const { data } = await axios.post('/api/seller/login', payload)
      if (data?.success) {
        setIsSeller(true)
        navigate('/seller')
      } else {
        toast.error(data?.message || "Login failed")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSeller) {
      navigate("/seller")
    }
  }, [isSeller, navigate])

  // don't render form if already seller
  return !isSeller && (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600'>
      <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
        <p className='text-2xl font-medium m-auto'><span className='text-primary'>Seller</span> Login</p>

        <div className='w-full'>
          <label className='block text-xs font-medium' htmlFor='seller-email'>Email</label>
          <input
            id='seller-email'
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder='admin@example.com'
            className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
            required
            aria-label="seller email"
          />
        </div>

        <div className='w-full'>
          <label className='block text-xs font-medium' htmlFor='seller-password'>Password</label>
          <input
            id='seller-password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder='greencart123'
            className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
            required
            aria-label="seller password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-primary text-white w-full py-2 rounded-md ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  )
}

export default SellerLogin
