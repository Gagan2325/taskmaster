const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
 // Initialize database connection
const connectToMongoDB = require('./db/db');
var cookieParser = require('cookie-parser')
const authMiddleware = require('./src/middleware/auth');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TaskMaster API',
    version: '1.0.0',
    status: 'Server is running successfully'
  });
});

app.use(cookieParser());
app.use('/api/auth', require('./src/controller/user')); // Auth routes
app.use('/project', authMiddleware, require('./src/controller/project')); // Project routes
app.use('/task', authMiddleware, require('./src/controller/task')); // Task routes
// Start the server

async function connection() {
    try {
        await connectToMongoDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}
connection();


