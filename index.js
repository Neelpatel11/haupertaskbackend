const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  'mongodb+srv://npatel1073:sGV9QM4InLypFA1C@cluster0.aznhr4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on('error', (error) => console.error('Error connecting to MongoDB:', error));
db.once('open', () => console.log('Connected to MongoDB successfully'));


const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  isDeleted: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

app.get('/users', async (req, res) => {
  const users = await User.find({ isDeleted: false });
  res.json(users);
});

app.get('/deleted-users', async (req, res) => {
  const users = await User.find({ isDeleted: true });
  res.json(users);
});

app.post('/users', async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      const user = new User({ name, email, mobile });
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, mobile } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      const user = await User.findByIdAndUpdate(
        id,
        { name, email, mobile },
        { new: true }
      );
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isDeleted: true });
  res.json({ message: 'User deleted' });
});

app.put('/restore-user/:id', async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isDeleted: false });
  res.json({ message: 'User restored' });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
