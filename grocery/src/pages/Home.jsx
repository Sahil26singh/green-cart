import React from 'react'
import Mainbanner from '../components/Mainbanner'
import Categories from '../components/Categories'
import Bestseller from '../components/Bestseller'
import BottomBanner from '../components/BottomBanner'
import Newsletter from '../components/Newsletter'


const Home = () => {
  return (
    <div className='mt-10'>
      <Mainbanner />
      <Categories />
      <Bestseller />
      <BottomBanner />
      <Newsletter />
    </div>
  )
}

export default Home
