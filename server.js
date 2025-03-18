const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the Event Planning !');
});


// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    date: Date,
    time: String,
    category: String,
    reminder: Boolean,
    email: String
});
const Event = mongoose.model('Event', EventSchema);


// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: 'User registered successfully' });
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
});

// Middleware for Authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ message: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// Create Event
app.post('/events', authenticate, async (req, res) => {
    const { name, description, date, time, category, reminder, email } = req.body;
    const event = new Event({ userId: req.userId, name, description, date, time, category, reminder, email });
    await event.save();
    res.json({ message: 'Event created successfully' });

    // Send Reminder Email
    if (reminder) {
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Reminder for Event: ${name}`,
            text: `Your event "${name}" is scheduled for ${date} at ${time}.`
        });
    }
});

// View Events
app.get('/events', authenticate, async (req, res) => {
    const events = await Event.find({ userId: req.userId }).sort({ date: 1 });
    res.json(events);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
