import React, { useState, useEffect } from "react";
import { getCurrentSeller, getSellerProfile, updateSellerProfile } from "../../firebase/sellerAuth";
import { updatePassword } from "firebase/auth";
import { auth } from "../../firebase/config";  // Make sure 'auth' is used for password updates
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const SellerSettings = () => {
    const [sellerData, setSellerData] = useState({
        brandName: "",
        phoneNumber: "",
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        businessDescription: "",
    });
    const [currentPassword, setCurrentPassword] = useState("");  // State for the current password
    const [newPassword, setNewPassword] = useState("");  // New password input
    const [confirmPassword, setConfirmPassword] = useState("");  // Confirm password input
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch the current seller data
    useEffect(() => {
        const fetchSellerData = async () => {
            const currentUser = getCurrentSeller();
            if (currentUser) {
                const { success, data, error } = await getSellerProfile(currentUser.uid);
                if (success) {
                    setSellerData(data);
                } else {
                    setError(error);
                }
            }
        };

        fetchSellerData();
    }, []);

    // Handle form submission for profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setError(null);

        const currentUser = getCurrentSeller();
        if (currentUser) {
            const { success, error } = await updateSellerProfile(currentUser.uid, sellerData);
            setIsProfileLoading(false);
            if (success) {
                setSuccessMessage("Profile updated successfully!");
            } else {
                setError(error);
            }
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsPasswordLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (user && newPassword && currentPassword) {
            try {
                // Reauthenticate the user with their current password
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);

                // Update the password
                await updatePassword(user, newPassword);
                setSuccessMessage("Password updated successfully!");

                // Reset the password form fields after successful update
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } catch (err) {
                console.error("Password update error:", err);
                if (err.code === "auth/requires-recent-login") {
                    setError("Please log in again to change your password.");
                } else if (err.code === "auth/invalid-credential") {
                    setError("The current password you entered is incorrect.");
                } else {
                    setError("Error updating password. Please try again.");
                }
            }
            setIsPasswordLoading(false);
        }
    };

    // Handle input changes for profile
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSellerData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <div className="d-flex">
            {/* Seller Sidebar */}
            <SellerSidebar />
            <div className="flex-grow-1 p-4" >
                <Container fluid >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Seller Settings</h2>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Row>
                        <Col md={6} lg={11} >
                            {/* Profile Update Form */}
                            <Form onSubmit={handleProfileUpdate}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="brandName">
                                            <Form.Label>Brand Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="brandName"
                                                value={sellerData.brandName}
                                                onChange={handleInputChange}
                                                placeholder="Enter Brand Name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="phoneNumber">
                                            <Form.Label>Contact Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phoneNumber"
                                                value={sellerData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter Contact Number"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row style={{ marginTop: "16px" }}>
                                    <Col md={6}>
                                        <Form.Group controlId="email">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={sellerData.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter Email"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="firstName">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={sellerData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="Enter First Name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row style={{ marginTop: "16px" }}>
                                    <Col md={6}>
                                        <Form.Group controlId="lastName">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={sellerData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Enter Last Name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="address">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={sellerData.address}
                                                onChange={handleInputChange}
                                                placeholder="Enter Address"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group controlId="businessDescription" style={{ marginTop: "16px" }}>
                                    <Form.Label>Brand Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="businessDescription"
                                        value={sellerData.businessDescription}
                                        onChange={handleInputChange}
                                        placeholder="Enter Brand Description"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={isProfileLoading} style={{ marginTop: "20px" }}>
                                        {isProfileLoading ? <Spinner as="span" animation="border" size="sm" /> : "Save Profile"}
                                    </Button>
                                </div>
                            </Form>

                            <hr />

                            {/* Password Update Form */}
                            <Form onSubmit={handlePasswordChange}>
                                <Row>
                                    <Form.Group controlId="currentPassword" style={{ marginBottom: "16px" }}>
                                        <Form.Label>Current Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </Form.Group>
                                    <Col md={6}>
                                        <Form.Group controlId="newPassword">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="confirmPassword">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end">
                                    <Button variant="warning" type="submit" disabled={isPasswordLoading} style={{ marginTop: "20px" }}>
                                        {isPasswordLoading ? <Spinner as="span" animation="border" size="sm" /> : "Change Password"}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default SellerSettings;
