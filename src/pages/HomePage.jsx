"use client"

import HeroBanner from "../components/HeroBanner"
import BrandSection from "../components/BrandSection"
import CategorySection from "../components/CategorySection"
import DealsSection from "../components/DealsSection"
import FeaturedProducts from "../components/FeaturedProducts"

const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <BrandSection />
      <CategorySection />
      <DealsSection />
      <FeaturedProducts />
    </>
  )
}

export default HomePage
