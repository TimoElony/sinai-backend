require("./instrument.js");

// All other imports below
// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");

const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const climbingroutes = require('./routes/climbingroutes');
const climbingareas = require('./routes/climbingareas');
const walltopos = require('./routes/walltopos');
const geodata = require('./routes/geodata');
const authRoutes = require('./routes/authRoutes');
const port = process.env.PORT || 5000;
const verifySupabaseToken = require('./middleware/auth');
const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5174', 'https://sinai-app.vercel.app', 'https://www.sinaiclimbing.com'], // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies (if needed)
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // gives access to req.body
app.use(express.urlencoded({ extended: true }));

//auth
app.use('/auth', authRoutes)

// Routes
app.use('/climbingroutes',climbingroutes);
app.use('/climbingareas',climbingareas);
app.use('/geodata', geodata);

app.use('/walltopos', walltopos);

//Routes protected by authentication
app.get('/protected', verifySupabaseToken, (req, res) => {
  res.json({message: 'secure data', user: req.user});
})

//Sentry middleware
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


