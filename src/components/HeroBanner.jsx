import { Carousel, Container } from "react-bootstrap"

const HeroBanner = () => {
  const banners = [
    {
      id: 1,
      imageUrl: "/vibrant-fashion-sale.png",
      alt: "Summer Collection Sale",
    },
    {
      id: 2,
      imageUrl: "/urban-chic-arrivals.png",
      alt: "New Arrivals",
    },
    {
      id: 3,
      imageUrl: "/luxury-fashion-sale.png",
      alt: "Exclusive Brands",
    },
  ]

  return (
    <Container fluid className="p-0 mb-4">
      <Carousel fade className="hero-banner">
        {banners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div className="banner-container" style={{ height: "60vh" }}>
              <img
                className="d-block w-100 h-100"
                src={banner.imageUrl || "/placeholder.svg"}
                alt={banner.alt}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  )
}

export default HeroBanner
