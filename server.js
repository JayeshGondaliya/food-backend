const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // import analytics
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:'https://food-frontend-smoky.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // include OPTIONS
  },
});

// CORS middleware – must come before routes
app.use(cors({ origin: process.env.CLIENT_URL || 'https://food-frontend-smoky.vercel.app' }));
app.use(express.json());

// Make io accessible in controllers
app.set('io', io);

// Routes – all after CORS
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes); // add analytics route

// Error handling
app.use(errorHandler);

// ... rest of server.js (socket, db connection, etc.)

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Simulate status updates for a specific order (for demo)
    socket.on('track_order', (orderId) => {
        console.log(`Tracking order ${orderId}`);
        // You can emit status changes manually via API, or simulate here
        // For simulation, we'll update status every 10 sec via a background process
        // See simulateStatusUpdates function
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Background status simulation (for demo purposes)
const Order = require('./models/Order');
const statusFlow = ['received', 'preparing', 'out_for_delivery', 'delivered'];

async function simulateStatusUpdates() {
    const orders = await Order.find({ status: { $ne: 'delivered' } });
    for (const order of orders) {
        const currentIndex = statusFlow.indexOf(order.status);
        if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            // Update after random delay (10-20 sec) – for demo we'll update quickly in real scenario
            setTimeout(async () => {
                order.status = nextStatus;
                await order.save();
                io.emit('order_status_updated', { orderId: order._id, status: nextStatus });
                console.log(`Order ${order._id} updated to ${nextStatus}`);
            }, Math.random() * 100000 + 50000); // 50-150 sec
        }
    }
}

// Run simulation every 60 seconds
setInterval(simulateStatusUpdates, 60000);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
