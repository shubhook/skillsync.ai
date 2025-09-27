require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

// import all required resources
const { apiCall } = require('./utils/api');

const app = express();
const port = 3000;

app.use(cors({
  orgin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));


app.use(express.json());



app.get('/', async (req, res) => {
    res.send("Welcome to SkillSync");
});

app.post('/ai', async (req, res) => {
    const dataset = req.body.dataset;
    console.log("Loading...");

    try{
        const response =  await apiCall(dataset);
        console.log(response);
        res.json({response});
    } 
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Failed to generate project suggestion"});
    }
});

app.listen(port, () => { 
console.log(`Server is running on port ${port}`);
});
