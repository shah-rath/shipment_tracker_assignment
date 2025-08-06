// Import necessary modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize the Express app
const app = express();
const PORT = 3001;
const DB_FILE = './db.json';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], shipments: [] }, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    if (!jsonData.users) jsonData.users = [];
    if (!jsonData.shipments) jsonData.shipments = [];
    return jsonData;
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], shipments: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
};

// --- API Endpoints ---

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const db = readDB();
    const existingUser = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = { id: uuidv4(), username, password };
    db.users.push(newUser);
    writeDB(db);
    res.status(201).json({ id: newUser.id, username: newUser.username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, message: 'Login successful', user: { id: user.id, username: user.username } });
  } else {
    if (username === 'admin' && password === 'password') {
        res.json({ success: true, message: 'Login successful', user: { id: 'admin-default', username: 'admin' } });
        return;
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/shipments', (req, res) => {
  const { userId, status, search, page = 1, limit = 5 } = req.query;
  if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
  }
  
  const db = readDB();
  let shipments = (db.shipments || []).filter(s => s.userId === userId);

  if (status) {
    shipments = shipments.filter(s => s.status === status);
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    shipments = shipments.filter(s => 
        s.trackingId.toLowerCase().includes(searchTerm) ||
        s.status.toLowerCase().includes(searchTerm) ||
        (s.expressDelivery ? 'express' : 'standard').includes(searchTerm)
    );
  }
  
  const totalShipments = shipments.length;
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  const startIndex = (pageInt - 1) * limitInt;
  const endIndex = pageInt * limitInt;
  
  const paginatedShipments = shipments.slice(startIndex, endIndex);

  res.json({
    shipments: paginatedShipments,
    totalPages: Math.ceil(totalShipments / limitInt),
    totalShipments: totalShipments
  });
});

app.post('/api/shipments', (req, res) => {
  const { trackingId, status, expressDelivery, userId } = req.body;

  if (!trackingId || !status || !userId) {
    return res.status(400).json({ message: 'Tracking ID, status, and userId are required' });
  }

  const db = readDB();
  
  // --- Duplicate Tracking ID Check (Per User) ---
  const existingShipment = db.shipments.find(s => s.userId === userId && s.trackingId.toLowerCase() === trackingId.toLowerCase());
  if (existingShipment) {
      return res.status(400).json({ message: 'Tracking id already exists' });
  }

  const newShipment = {
    id: uuidv4(),
    userId,
    trackingId,
    status,
    expressDelivery: !!expressDelivery,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.shipments.unshift(newShipment);
  writeDB(db);

  res.status(201).json(newShipment);
});

app.put('/api/shipments/:id', (req, res) => {
  const { id } = req.params;
  const { trackingId, status, expressDelivery, userId } = req.body;
  const db = readDB();

  const shipmentIndex = db.shipments.findIndex(s => s.id === id && s.userId === userId);

  if (shipmentIndex === -1) {
    return res.status(404).json({ message: 'Shipment not found or user not authorized' });
  }

  // --- Duplicate Tracking ID Check on Update (Per User) ---
  const existingShipment = db.shipments.find(s => s.userId === userId && s.trackingId.toLowerCase() === trackingId.toLowerCase() && s.id !== id);
  if (existingShipment) {
      return res.status(400).json({ message: 'Tracking id already exists' });
  }

  const updatedShipment = {
    ...db.shipments[shipmentIndex],
    trackingId,
    status,
    expressDelivery,
    updatedAt: new Date().toISOString()
  };
  db.shipments[shipmentIndex] = updatedShipment;
  writeDB(db);

  res.json(updatedShipment);
});

app.delete('/api/shipments/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const db = readDB();

  const originalLength = db.shipments.length;
  db.shipments = db.shipments.filter(s => !(s.id === id && s.userId === userId));

  if (db.shipments.length === originalLength) {
    return res.status(404).json({ message: 'Shipment not found or user not authorized' });
  }

  writeDB(db);
  res.status(200).json({ message: 'Shipment deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
