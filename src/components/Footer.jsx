import { Container, Row, Col, ListGroup } from "react-bootstrap"

const Footer = () => {
  return (
    <footer className="bg-danger text-white pt-5 pb-3 w-100">
      <Container fluid className="px-4 px-md-5">
        <Row>
          <Col md={3} className="mb-4 d-flex flex-column align-items-start">
            <div className="d-flex align-items-center mb-3">
              {/* <img src="/LOGO.png" alt="On Sale Now" height="100" className="me-2" /> */}
              <h5 className="mb-0 fw-bold">On Sale Now</h5>
            </div>
            <ListGroup variant="flush">
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Men</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Women</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Kids</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Home & Living</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Beauty</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Gift Cards</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3} className="mb-4">
            <h5 className="mb-3 fw-bold">CUSTOMER POLICIES</h5>
            <ListGroup variant="flush">
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Contact Us</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">FAQ</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">T&C</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Terms Of Use</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Track Orders</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Shipping</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Cancellation</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Returns</ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 px-0 py-1 text-white">Privacy Policy</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3} className="mb-4">
          
            <h5 className="mb-3 fw-bold mt-4">KEEP IN TOUCH</h5>
            <div className="d-flex gap-3">
              <i className="bi bi-facebook fs-4"></i>
              <i className="bi bi-twitter fs-4"></i>
              <i className="bi bi-youtube fs-4"></i>
              <i className="bi bi-instagram fs-4"></i>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div className="d-flex align-items-start mb-3">
              
              <div>
                <h6 className="fw-bold mb-1">100% ORIGINAL</h6>
                <p className="small text-white-50">guarantee for all products</p>
              </div>
            </div>
            <div className="d-flex align-items-start">
              
              <div>
                <h6 className="fw-bold mb-1">Return within 30days</h6>
                <p className="small text-white-50">of receiving your order</p>
              </div>
            </div>
          </Col>
        </Row>
        <hr className="border-light" />
        <div className="text-center text-white-50 small">
          <p>© 2023 www.onsalenow.com. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
