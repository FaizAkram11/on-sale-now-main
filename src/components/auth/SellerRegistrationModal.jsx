"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { registerSeller } from "../../firebase/sellerAuth"
import { Link } from "react-router-dom"

const SellerRegistrationModal = ({ show, onHide, user, onSellerRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    brandName: "",
    businessDescription: "",
    website: "",
    storeCategory: "",
    taxId: "123",
    password: "",
    confirmPassword: "",
    agreedToPolicy: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  // const [agreedToPolicy, setAgreedToPolicy] = useState(false)

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        brandName: "",
        businessDescription: "",
        website: "",
        storeCategory: "",
        taxId: "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [user, show])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if passwords match for new users
      if (!user && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Check password length for new users
      if (!user && formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // Remove this check
      // if (!user || !user.uid) {
      //   throw new Error("You must be logged in to register as a seller")
      // }

      // Validate required fields
      if (!formData.brandName) {
        throw new Error("Brand name is required")
      }

      if (!formData.agreedToPolicy) {
        return alert("You must agree to our policy in order to register yourself as a seller")
      }

      // If not logged in, check password requirements
      if (!user) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match")
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters")
        }
      }
      // Register as a seller (either with existing user ID or as new seller)
      const result = await registerSeller(user ? user.uid : null, {
        ...formData,
        registeredAt: new Date().toISOString(),
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSellerRegistrationSuccess({
            ...formData,
            sellerId: result.sellerId,
          })
        }, 1500)
      } else {
        setError(result.error || "Failed to register as a seller. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.")
      console.error("Seller registration error:", err)
    } finally {
      setLoading(false)
    }
  }

  const storeCategories = [
    "Clothing & Apparel",
    "Footwear",
    "Accessories",
    "Beauty & Personal Care",
    "Home & Living",
    "Electronics",
    "Other",
  ]

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Become a Seller</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            Registration successful! Redirecting to your seller dashboard...
          </Alert>
        )}

        <div className="text-center mb-4">
          <h4>Register Your Brand</h4>
          <p className="text-muted">Join our marketplace and start selling your products</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={user && user.email}
            />
            {user && user.email && (
              <Form.Text className="text-muted">Email cannot be changed as you're already logged in.</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              name="address"
              rows={2}
              placeholder="Your business address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {!user && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!user}
                    />
                    <Form.Text className="text-muted">Password must be at least 6 characters long</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!user}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          <h5 className="mt-4 mb-3 border-bottom pb-2">Brand Information</h5>

          <Form.Group className="mb-3">
            <Form.Label>Brand Name</Form.Label>
            <Form.Control
              type="text"
              name="brandName"
              placeholder="Your brand name"
              value={formData.brandName}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              This will be displayed to customers when they view your products.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Store Category</Form.Label>
                <Form.Select name="storeCategory" value={formData.storeCategory} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {storeCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            {/* <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tax ID / GST Number (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="taxId"
                  placeholder="Enter your tax ID"
                  value={formData.taxId}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col> */}
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Business Description</Form.Label>
            <Form.Control
              as="textarea"
              name="businessDescription"
              rows={3}
              placeholder="Tell us about your business and products"
              value={formData.businessDescription}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Describe your brand, products, and what makes your store unique.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Website (Optional)</Form.Label>
            <Form.Control
              type="url"
              name="website"
              placeholder="https://yourbrand.com"
              value={formData.website}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="agreedToPolicy"
              name="agreedToPolicy"
              checked={formData.agreedToPolicy}
              // value={formData.agreedToPolicy}
              onChange={handleChange}
              label={
                <>
                  I agree to the{" "}
                  <Link to="/policy-agreement" target="_blank" rel="noopener noreferrer">
                    Platform Policy
                  </Link>
                </>
              }
            />
          </Form.Group>

          <div className="d-grid gap-2 mt-4">
            <Button variant="danger" type="submit" disabled={loading || success}>
              {loading ? "Registering..." : "Register as Seller"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default SellerRegistrationModal
