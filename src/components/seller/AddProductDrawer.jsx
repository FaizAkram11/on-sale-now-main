"use client"

import { useState, useEffect } from "react"
import { Offcanvas, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap"
import { addSellerProduct, updateSellerProduct } from "../../firebase/sellerAuth"

const AddProductDrawer = ({ show, onHide, seller, onProductAdded, onProductUpdated, editProduct = null }) => {
  const initialFormState = {
    name: "",
    brand: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    image: null,
    imagePreview: null,
    sizes: "",
    keywords: "",
    discountPercent: "",
    stock: "",
    sold: 0,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const isEditing = !!editProduct

  // Reset form when drawer opens or editProduct changes
  useEffect(() => {
    if (show) {
      setError(null)
      setSuccess(false)

      if (editProduct) {
        // Populate form with existing product data for editing
        console.log("Populating form with edit product data:", editProduct) // Add this debug log
        setFormData({
          name: editProduct.name || "",
          brand: editProduct.brand || "",
          price: editProduct.price || "",
          originalPrice: editProduct.originalPrice || "",
          description: editProduct.description || "",
          category: editProduct.category || "",
          image: editProduct.image || null,
          imagePreview: editProduct.image || null,
          sizes: Array.isArray(editProduct.sizes) ? editProduct.sizes.join(", ") : "",
          keywords: Array.isArray(editProduct.keywords) ? editProduct.keywords.join(", ") : "",
          discountPercent: editProduct.discountPercent || "",
          stock: editProduct.stock || "",
          sold: editProduct.sold || 0,
        })
      } else {
        // Reset form for adding new product
        setFormData(initialFormState)
      }
    }
  }, [show, editProduct])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setFormData({
        ...formData,
        image: reader.result, // This is the base64 string
        imagePreview: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category || !formData.stock || (!formData.image && !isEditing)) {
        throw new Error("Name, price, stock, category, and image are required")
      }

      // Check if seller exists before accessing its properties
      if (!seller) {
        throw new Error("Seller information is not available")
      }

      // Format brand name for website attribute (lowercase with hyphens)
      const websiteValue = (seller.brandName || "").toLowerCase().replace(/\s+/g, "-")

      // Parse sizes and keywords into arrays
      const sizes = formData.sizes ? formData.sizes.split(",").map((size) => size.trim()) : []

      const keywords = formData.keywords ? formData.keywords.split(",").map((keyword) => keyword.trim()) : []

      // Calculate discount percent if not provided
      let discountPercent = formData.discountPercent ? Number.parseFloat(formData.discountPercent) : 0
      if (!discountPercent && formData.originalPrice && formData.price) {
        const originalPrice = Number.parseFloat(formData.originalPrice)
        const price = Number.parseFloat(formData.price)
        if (originalPrice > price) {
          discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100)
        }
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        brand: formData.brand || seller.brandName || "",
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
        description: formData.description,
        category: formData.category.toLowerCase(),
        website: websiteValue, // Formatted brand name
        sizes,
        keywords,
        discountPercent,
        sellerId: seller.id,
        onSale: true, // All products are on sale by default
        stock: Number.parseFloat(formData.stock),
        sold : formData.sold
      }

      // Only include image if it's changed or new
      if (formData.image) {
        productData.image = formData.image
      }

      // Add dateUpdated for editing
      if (isEditing) {
        productData.dateUpdated = new Date().toISOString()
      } else {
        productData.dateAdded = new Date().toISOString()
      }

      console.log("Submitting product data:", {
        ...productData,
        image: productData.image ? "Image data present" : "No image data",
        isEditing: isEditing,
        editProductId: isEditing ? editProduct.id : null,
      })

      let result
      if (isEditing) {
        // Update existing product
        result = await updateSellerProduct(editProduct.id, productData)
        console.log("Update result:", result) // Add this debug log

        if (result.success) {
          setSuccess(true)

          // Notify parent component
          if (onProductUpdated) {
            onProductUpdated(editProduct.id, { ...productData, id: editProduct.id })
          }
        }
      } else {
        // Add new product
        result = await addSellerProduct(seller.id || seller.uid, productData)
        console.log("boss",result)
        if (result.success) {
          setSuccess(true)
          setFormData(initialFormState)

          // Notify parent component
          if (onProductAdded) {
            onProductAdded(result.productId, productData)
          }
        }
      }

      if (result.success) {
        // Close drawer after a delay
        setTimeout(() => {
          onHide()
        }, 1500)
      } else {
        throw new Error(result.error || `Failed to ${isEditing ? "update" : "add"} product`)
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
      console.error(`Error ${isEditing ? "updating" : "adding"} product:`, err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["Men", "Women", "Kids", "Footwear", "Accessories", "Beauty"]

  // Safely access seller properties
  const brandName = seller?.brandName || "Your Brand"

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      style={{ width: "60%" }} // Set width to 60% using inline style
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{isEditing ? "Edit Product" : "Add New Product"}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            Product {isEditing ? "updated" : "added"} successfully!
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <h5 className="mb-3 border-bottom pb-2">Basic Information</h5>

          <Form.Group className="mb-3">
            <Form.Label>
              Product Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder={`Default: ${brandName}`}
                />
                <Form.Text className="text-muted">Leave empty to use your brand name: {brandName}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Category <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Price (Rs.) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Current selling price"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Original Price (Rs.)</Form.Label>
                <Form.Control
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="Original price before discount"
                />
                <Form.Text className="text-muted">Leave empty if there's no discount</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Discount Percentage</Form.Label>
            <Form.Control
              type="number"
              name="discountPercent"
              value={formData.discountPercent}
              onChange={handleChange}
              placeholder="Will be calculated automatically if left empty"
              min="0"
              max="100"
            />
            <Form.Text className="text-muted">
              Will be calculated automatically from original and current price if left empty
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product"
            />
          </Form.Group>

          <h5 className="mb-3 mt-4 border-bottom pb-2">Product Details</h5>

          <Form.Group className="mb-3">
            <Form.Label>Sizes (comma separated)</Form.Label>
            <Form.Control
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              placeholder="S, M, L, XL"
            />
            <Form.Text className="text-muted">Enter sizes separated by commas (e.g., S, M, L, XL)</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Keywords (comma separated)</Form.Label>
            <Form.Control
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="shirt, cotton, casual"
            />
            <Form.Text className="text-muted">Keywords help with search and categorization</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Stock Quantity <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter total available stock quantity"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Product Image {!isEditing && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!formData.image && !isEditing}
            />
            <Form.Text className="text-muted">
              {isEditing
                ? "Upload a new image only if you want to change the existing one. Maximum file size: 5MB"
                : "Maximum file size: 5MB"}
            </Form.Text>

            {formData.imagePreview && (
              <div className="mt-3 text-center">
                <img
                  src={formData.imagePreview || "/placeholder.svg"}
                  alt="Product preview"
                  style={{ maxHeight: "200px", maxWidth: "100%" }}
                  className="border rounded"
                />
              </div>
            )}
          </Form.Group>

          <div className="d-grid gap-2 mt-4">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {isEditing ? "Updating Product..." : "Adding Product..."}
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default AddProductDrawer
