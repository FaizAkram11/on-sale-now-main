import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config"; // adjust path if needed
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Table } from "react-bootstrap";
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import { Container } from "react-bootstrap";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4F81", "#A28EFF"];

const AdminAnalytics = () => {
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [brandSales, setBrandSales] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [orderStatusCounts, setOrderStatusCounts] = useState([]);
    const [loading, setLoading] = useState(true); // NEW


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const sellersSnap = await get(ref(database, "Seller"));
        const productsSnap = await get(ref(database, "products"));
        const ordersSnap = await get(ref(database, "orders"));

        const sellersData = sellersSnap.exists() ? sellersSnap.val() : {};
        const productsData = productsSnap.exists() ? productsSnap.val() : {};
        const ordersData = ordersSnap.exists() ? ordersSnap.val() : {};

        const sellersArray = Object.entries(sellersData).map(([id, s]) => ({
            ...s,
            id,
        }));
        const productsArray = Object.entries(productsData).map(([id, p]) => ({
            ...p,
            id,
        }));
        const ordersArray = Object.entries(ordersData).map(([id, o]) => ({
            ...o,
            id,
        }));

        setSellers(sellersArray);
        setProducts(productsArray);
        setOrders(ordersArray);

        calculateBrandAndCategorySales(productsArray);
        calculateOrderStatusCounts(ordersArray);
        setLoading(false);
    };

    const calculateBrandAndCategorySales = (productsArray) => {
        const brandMap = {};
        const categoryMap = {};

        productsArray.forEach((p) => {
            const sold = Number(p.sold) || 0;
            if (p.brand) {
                brandMap[p.brand] = (brandMap[p.brand] || 0) + sold;
            }
            if (p.category) {
                categoryMap[p.category] = (categoryMap[p.category] || 0) + sold;
            }
        });

        const sortedBrands = Object.entries(brandMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        const sortedCategories = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        setBrandSales(sortedBrands);
        setCategorySales(sortedCategories);
    };

    const calculateOrderStatusCounts = (ordersArray) => {
        const statusCounts = {};

        ordersArray.forEach((order) => {
            const status = order.status || "unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const pieData = Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            value: count,
        }));

        setOrderStatusCounts(pieData);
    };

    const getSellerStats = (sellerId) => {
        const sellerProducts = products.filter((p) => p.sellerId === sellerId);
        const totalStock = sellerProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
        const totalSold = sellerProducts.reduce((sum, p) => sum + (Number(p.sold) || 0), 0);
        const percentSold = totalStock > 0 ? ((totalSold / totalStock) * 100).toFixed(1) : "0";

        return { totalStock, totalSold, percentSold };
    };

    return (
        <div className="admin-dashboard d-flex" style={{ width: "100%", overflow: "hidden" }}>
            <AdminSidebar />
            <div className="flex-grow-1" style={{ overflow: "auto", height: "100vh" }}>
                <AdminHeader />
                <Container fluid className="py-4 px-4">
                    <h2 className="mb-4">Admin Analytics</h2>
                    <div className="container mt-5">
                        {loading ? (
                            <div className="text-center my-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <h3 className="mt-4">Top 3 Brands Bought by Buyers</h3>
                                        <PieChart width={400} height={300}>
                                            <Pie
                                                data={brandSales.map(([name, value]) => ({ name, value }))}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                label
                                            >
                                                {brandSales.map((entry, index) => (
                                                    <Cell key={`brand-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </div>

                                    <div>
                                        <h3 className="mt-4">Top 3 Categories Bought by Buyers</h3>
                                        <PieChart width={400} height={300}>
                                            <Pie
                                                data={categorySales.map(([name, value]) => ({ name, value }))}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                label
                                            >
                                                {categorySales.map((entry, index) => (
                                                    <Cell key={`category-cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </div>
                                </div>

                                <h3 className="mt-5">Order Status Breakdown</h3>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={orderStatusCounts}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label
                                    >
                                        {orderStatusCounts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>

                                <h4 className="mt-5 mb-3">Seller Inventory & Sales</h4>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Seller UID</th>
                                            <th>Total Stock</th>
                                            <th>Total Sold</th>
                                            <th>% Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellers.map((seller) => {
                                            const { totalStock, totalSold, percentSold } = getSellerStats(seller.uid);
                                            const isHighSold = percentSold >= 70;
                                            return (
                                                <tr key={seller.uid} className={isHighSold ? "high-sold-row" : ""}>
                                                    <td>{seller.name || seller.email || seller.uid}</td>
                                                    <td>{totalStock}</td>
                                                    <td>{totalSold}</td>
                                                    <td>{percentSold}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </div>

                </Container>
            </div>
        </div>
    );
};

export default AdminAnalytics;
