const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const climbingroutes = require('./routes/climbingroutes');
const climbingareas = require('./routes/climbingareas');
const newroute = require('./routes/newroute');

// Middleware
app.use(cors());
app.use(express.json()); // gives access to req.body

// Routes

app.use('/climbingroutes',climbingroutes);
app.use('/climbingareas',climbingareas);
app.use('/newroute',newroute);



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});


