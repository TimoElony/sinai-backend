const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const climbingroutes = require('./routes/climbingroutes');
const climbingareas = require('./routes/climbingareas');
const newroute = require('./routes/newroute');
const port = process.env.PORT || 5000;
const verifySupabaseToken = require('./middleware/auth');

// Middleware
app.use(cors());
app.use(express.json()); // gives access to req.body

// Routes

app.use('/climbingroutes',climbingroutes);
app.use('/climbingareas',climbingareas);
app.use('/newroute',newroute);

app.get('/protected', verifySupabaseToken, (req, res) => {
  res.json({message: 'secure data', user: req.user});
})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


