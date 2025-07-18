"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Image,
  Button,
  Badge,
  Tabs,
  Tab,
  ListGroup,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap"
import { getProductById } from "../firebase/products"
import { useCart } from "../context/CartContext"

const ProductDetailPage = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [animateToCart, setAnimateToCart] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const productImageRef = useRef(null)
  const cartIconRef = useRef(null)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Countdown timer effect
  useEffect(() => {
    if (!product?.saleEndDate) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const endDate = new Date(product.saleEndDate).getTime()
      const difference = endDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [product?.saleEndDate])

  // Check if sale is active
  const isSaleActive = () => {
    if (!product?.saleStartDate || !product?.saleEndDate) return false
    
    const now = new Date().getTime()
    const startDate = new Date(product.saleStartDate).getTime()
    const endDate = new Date(product.saleEndDate).getTime()
    
    return now >= startDate && now <= endDate
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getProductById(productId)

        if (result.success) {
          console.log("product is", result.data);
          setProduct(result.data)
          // Set default selected color if available
          if (result.data.colors && result.data.colors.length > 0) {
            setSelectedColor(result.data.colors[0])
          }
        } else {
          setError("Product not found")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  // Function to format website name for display
  const formatWebsiteName = (website) => {
    if (!website) return ""

    // Convert hyphenated names to capitalized words
    return website
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to parse price by removing currency symbols
  const parsePrice = (priceValue) => {
    if (!priceValue) return 0

    // If it's already a number, return it
    if (typeof priceValue === 'number') {
      return priceValue
    }

    // Convert to string if it's not already
    const priceStr = String(priceValue)

    // Remove currency symbols, commas, and any non-numeric characters except decimal point
    const cleanPrice = priceStr.replace(/[^0-9.]/g, "")

    return Number.parseFloat(cleanPrice) || 0
  }

  // Function to calculate discount percentage with safety checks
  const calculateDiscount = (originalPrice, price, discountedPrice) => {
    // Parse prices to remove currency symbols and get numeric values
    const original = parsePrice(originalPrice)
    const current = parsePrice(price)
    const discounted = parsePrice(discountedPrice)

    // If discountedPrice is available, use it for calculation
    if (discounted > 0 && original > 0 && discounted < original) {
      return Math.round(((original - discounted) / original) * 100)
    }

    // Check if both are valid numbers and original is greater than current
    if (original > 0 && current > 0 && original > current) {
      return Math.round(((original - current) / original) * 100)
    }
    return 0
  }

  // Function to check if a product has a valid discount
  const hasDiscount = (product) => {
    if (!product) return false

    if (product.discountPercent && !isNaN(Number(product.discountPercent)) && Number(product.discountPercent) > 0) {
      return true
    }

    const original = parsePrice(product.originalPrice)
    const current = parsePrice(product.price)
    const discounted = parsePrice(product.discountedPrice)

    // Check if discountedPrice is less than originalPrice
    if (discounted > 0 && original > 0 && discounted < original) {
      return true
    }

    // Fallback to current price vs original price
    return original > 0 && current > 0 && original > current
  }

  // Function to display price without currency symbol
  const displayPrice = (priceValue) => {
    const numericPrice = parsePrice(priceValue)
    return numericPrice.toLocaleString()
  }

  // Function to get the current display price (prioritize discountedPrice if available)
  const getCurrentPrice = (product) => {
    const discounted = parsePrice(product.discountedPrice);
    const current = parsePrice(product.price);
    
    // If discountedPrice is available and valid, use it
    if (discounted > 0) {
      return discounted;
    }
    
    // Otherwise use current price
    return current;
  }

  // Function to calculate total price based on quantity
  const getTotalPrice = (product, qty) => {
    const currentPrice = getCurrentPrice(product);
    return currentPrice * qty;
  }

  // Helper to fix image URLs with width=1
  const getFixedImageUrl = (url) => {
    if (!url) return url;
    // Remove &width=1 or ?width=1 from the URL
    return url.replace(/[&?]width=1/, '');
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Check if size is selected when sizes are available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size")
      return
    }

    // Add to cart
    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        price: parsePrice(product.price),
        image: product.image,
        brand: product.brand,
        website: product.website,
      },
      quantity,
      selectedSize,
      selectedColor,
    )

    if (success) {
      setAddedToCart(true)

      // Trigger animation
      setAnimateToCart(true)

      // Reset animation state after animation completes
      setTimeout(() => {
        setAnimateToCart(false)
      }, 1000)

      // Reset added to cart message after a delay
      setTimeout(() => {
        setAddedToCart(false)
      }, 3000)
    }
  }

  // Handle buy now
  const handleBuyNow = () => {
    // Check if product has an external URL for buying
    if (product.product_detail_page_url) {
      // Open external URL in new tab
      window.open(product.product_detail_page_url, '_blank');
    } else {
      // Fallback to current cart flow
      handleAddToCart()
      navigate("/cart")
    }
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error || "Product not found"}</Alert>
        <Button as={Link} to="/" variant="outline-primary" className="mt-3">
          Back to Home
        </Button>
      </Container>
    )
  }

  // Get discount percent with safety checks
  let discountPercent = 0
  if (product.discountPercent && !isNaN(Number(product.discountPercent))) {
    discountPercent = Number(product.discountPercent)
  } else {
    discountPercent = calculateDiscount(product.originalPrice, product.price, product.discountedPrice)
  }

  return (
    <Container fluid className="my-4 px-4 px-md-5">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/category/${product.category.toLowerCase()}` }}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Product Details */}
      <Row>
        {/* Product Images */}
        <Col md={6} className="mb-4">
          <div className="position-relative">
            <Image
              ref={productImageRef}
              src={getFixedImageUrl(product.image) || "/placeholder.svg?height=600&width=500&query=product"}
              alt={product.name}
              fluid
              className="product-main-image"
              style={{ maxHeight: "600px", objectFit: "contain" }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/stylish-streetwear-collection.png"
              }}
            />
            {hasDiscount(product) && discountPercent > 0 && (
              <Badge
                bg="danger"
                className="position-absolute"
                style={{ top: "10px", right: "10px", fontSize: "1rem", padding: "0.5rem" }}
              >
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Thumbnail Images - if we had multiple images */}
          {product.additionalImages && product.additionalImages.length > 0 && (
            <Row className="mt-3">
              {product.additionalImages.map((img, index) => (
                <Col key={index} xs={3} className="mb-2">
                  <Image
                    src={getFixedImageUrl(img) || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    thumbnail
                    className="cursor-pointer"
                    style={{ height: "80px", objectFit: "cover" }}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Product Info */}
        <Col md={6}>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {product.brand && (
              <Link to={`/brand/${product.brand.toLowerCase().replace(/\s+/g, "-")}`} className="text-decoration-none">
                <Badge bg="primary" className="brand-badge" style={{ cursor: "pointer" }}>
                  {product.brand}
                </Badge>
              </Link>
            )}

            {/* {product.website && <Badge bg="secondary">{formatWebsiteName(product.website)}</Badge>} */}
          </div>
          <h2 className="mb-2">{product.name}</h2>

          <div className="d-flex align-items-center mb-3">
            <h3 className="fw-bold mb-0">
              Rs. {displayPrice(getTotalPrice(product, quantity))}
            </h3>
            {hasDiscount(product) && (
              <>
                <span className="text-muted text-decoration-line-through ms-3">
                  Rs. {displayPrice(parsePrice(product.originalPrice) * quantity)}
                </span>
                {discountPercent > 0 && <span className="text-danger ms-3">({discountPercent}% OFF)</span>}
              </>
            )}
            {quantity > 1 && (
              <span className="text-muted small ms-2">
                (Rs. {displayPrice(getCurrentPrice(product))} each)
              </span>
            )}
          </div>

          {/* Sale Countdown Timer */}
          {product.saleStartDate && product.saleEndDate && isSaleActive() && timeLeft && (
            <div className="mb-4 p-3 bg-light border rounded">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-clock text-danger me-2"></i>
                <h6 className="mb-0 text-danger fw-bold">Sale Ends Soon!</h6>
              </div>
              <div className="mb-2">
                <small className="text-muted">Sale ends on: {formatDate(product.saleEndDate)}</small>
              </div>
              <div className="d-flex gap-2">
                <div className="text-center bg-danger text-white rounded p-2" style={{ minWidth: "60px" }}>
                  <div className="fw-bold fs-5">{timeLeft.days}</div>
                  <small>Days</small>
                </div>
                <div className="text-center bg-danger text-white rounded p-2" style={{ minWidth: "60px" }}>
                  <div className="fw-bold fs-5">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <small>Hours</small>
                </div>
                <div className="text-center bg-danger text-white rounded p-2" style={{ minWidth: "60px" }}>
                  <div className="fw-bold fs-5">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <small>Minutes</small>
                </div>
                <div className="text-center bg-danger text-white rounded p-2" style={{ minWidth: "60px" }}>
                  <div className="fw-bold fs-5">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <small>Seconds</small>
                </div>
              </div>
            </div>
          )}

          {/* Sale Not Started Yet */}
          {product.saleStartDate && product.saleEndDate && !isSaleActive() && (
            <div className="mb-4 p-3 bg-warning border rounded">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-calendar-event text-warning me-2"></i>
                <h6 className="mb-0 text-warning fw-bold">Sale Coming Soon!</h6>
              </div>
              <div className="mb-2">
                <small className="text-muted">Sale starts on: {formatDate(product.saleStartDate)}</small>
              </div>
              <div className="mb-2">
                <small className="text-muted">Sale ends on: {formatDate(product.saleEndDate)}</small>
              </div>
            </div>
          )}

          <div className="mb-4">{product.description && <p>{product.description}</p>}</div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <h5>Select Size</h5>
              <div className="d-flex flex-wrap gap-2">
                {Array.isArray(product.sizes) ? (
                  product.sizes.map((size, index) => (
                    <Button
                      key={index}
                      variant={selectedSize === size ? "dark" : "outline-dark"}
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "50px", height: "50px" }}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))
                ) : (
                  <p>Multiple sizes available</p>
                )}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <h5>Select Color</h5>
              <div className="d-flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <Button
                    key={index}
                    variant={selectedColor === color ? "dark" : "outline-dark"}
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: selectedColor === color ? color : "white",
                      borderColor: color,
                    }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && <i className="bi bi-check text-white"></i>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-4">
            <h5>Quantity</h5>
            <div className="d-flex align-items-center">
              <Button variant="outline-dark" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <i className="bi bi-dash"></i>
              </Button>
              <span className="mx-3">{quantity}</span>
              <Button variant="outline-dark" size="sm" onClick={() => setQuantity(quantity + 1)}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
          </div>

          {/* Add to Cart and Buy Now Buttons */}
          <div className="d-flex gap-3 mb-4">
            <Button variant="danger" size="lg" className="px-4 py-2 flex-grow-1" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus me-2"></i>
              Add to Bag
            </Button>
            <Button variant="dark" size="lg" className="px-4 py-2 flex-grow-1" onClick={handleBuyNow}>
              <i className="bi bi-lightning me-2"></i>
              Buy Now
            </Button>
          </div>

          {/* Added to Cart Message */}
          {addedToCart && (
            <Alert variant="success" className="mb-4">
              <i className="bi bi-check-circle me-2"></i>
              Product added to your bag!
            </Alert>
          )}

          {/* Product Details Tabs */}
          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="Details">
              <div className="p-3">
                <ListGroup variant="flush">
                  {product.brand && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Brand</span>
                      <Link
                        to={`/brand/${product.brand.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-decoration-none brand-link"
                        style={{
                          color: "#ff3f6c",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        {product.brand}
                      </Link>
                    </ListGroup.Item>
                  )}
                  {product.material && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Material</span>
                      <span>{product.material}</span>
                    </ListGroup.Item>
                  )}
                  {product.category && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Category</span>
                      <span>{product.category}</span>
                    </ListGroup.Item>
                  )}
                  {product.website && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Seller</span>
                      <span>{formatWebsiteName(product.website)}</span>
                    </ListGroup.Item>
                  )}
                  {product.saleStartDate && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Sale Start Date</span>
                      <span>{formatDate(product.saleStartDate)}</span>
                    </ListGroup.Item>
                  )}
                  {product.saleEndDate && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Sale End Date</span>
                      <span className={isSaleActive() ? "text-danger fw-bold" : ""}>
                        {formatDate(product.saleEndDate)}
                      </span>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>
            </Tab>
            <Tab eventKey="delivery" title="Delivery">
              <div className="p-3">
                <h6 className="mb-3">Check Delivery Availability</h6>
                <Form className="mb-3">
                  <Form.Group className="mb-3">
                    <Form.Control type="text" placeholder="Enter Pincode" />
                  </Form.Group>
                  <Button variant="outline-dark" size="sm">
                    Check
                  </Button>
                </Form>
                <div className="mt-3">
                  <p>
                    <i className="bi bi-truck me-2"></i> Standard Delivery: 4-5 business days
                  </p>
                  <p>
                    <i className="bi bi-arrow-repeat me-2"></i> Easy 30 days return & exchange available
                  </p>
                </div>
              </div>
            </Tab>
            <Tab eventKey="reviews" title="Reviews">
              <div className="p-3">
                <p>No reviews yet. Be the first to review this product.</p>
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Flying animation element */}
      {animateToCart && (
        <div
          className="flying-cart-item"
          style={{
            backgroundImage: `url(${getFixedImageUrl(product.image) || "/stylish-streetwear-collection.png"})`,
          }}
        ></div>
      )}
    </Container>
  )
}

export default ProductDetailPage
