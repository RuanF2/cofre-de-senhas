require('dotenv').config();

const passport = require('passport');
require('./config/passport');
const session = require('express-session');
const express = require('express');
const path = require('path');
const app = express();

const authRoutes = require('./routes/authRoutes');
const cofreRoutes = require('./routes/cofreRoutes');

app.use(express.json());

app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(passport.initialize())
app.use(passport.session())

// Serve o frontend (public/index.html, dashboard.html, style.css, auth.js, dashboard.js)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/auth', authRoutes);
app.use('/cofre', cofreRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
});
