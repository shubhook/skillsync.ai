require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { apiCall } = require('./utils/api');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:3001',
  process.env.FRONTEND_URL || 'https://skillsync-frontend-five.vercel.app/'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.get('/', async (req, res) => {
    res.send("Welcome to SkillSync API");
});

app.post('/ai', async (req, res) => {
    const dataset = req.body.dataset;
    console.log("Generating project suggestions...");

    try {
        const response = await apiCall(dataset);
        console.log("Success");
        res.json({response});
    } 
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Failed to generate project suggestion"});
    }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => { 
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;