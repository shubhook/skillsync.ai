require('dotenv').config({ path: '../.env' });
const express = require('express');

// import all required resources
const { apiCall } = require('./utils/api');

const app = express();
const port = 3000;
app.use(express.json());


app.get('/', async (req, res) => {
    res.send("Welcome to SkillSync");
});

app.post('/ai', async (req, res) => {
    const dataset = req.body.dataset;
    console.log("Loading...");

    try{
        const response =  await apiCall(dataset);
        res.json({response});
    } 
    catch (error) {
        res.status(500).send("Error: " + error);
    }
});

app.listen(port, console.log("Server is running on port 3000"));
