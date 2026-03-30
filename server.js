const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const const { readJson, writeJson } = require('./utils/storage');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';




// ✅ FIXED ADMIN SYNC LOGIC (IMPORTANT)
const usersFile = path.join(__dirname, 'data', 'users.json');
const users = readJson(usersFile, []);

const adminEmail = String(process.env.ADMIN_EMAIL || 'ayesha@example.com').toLowerCase().trim();
const adminName = process.env.ADMIN_NAME || 'Ayesha Zahid';
const adminPassword = String(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!');

const passwordHash = bcrypt.hashSync(adminPassword, 10);

if (users.length === 0) {
  users.push({
    id: 'admin-1',
    name: adminName,
    email: adminEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  });
} else {
  users[0] = {
    ...users[0],
    id: users[0].id || 'admin-1',
    name: adminName,
    email: adminEmail,
    passwordHash,
    createdAt: users[0].createdAt || new Date().toISOString()
  };
}

writeJson(usersFile, users);


// EXPRESS SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


// GLOBAL VARIABLES
app.use((req, res, next) => {
  res.locals.appTitle = process.env.APP_TITLE || 'Ayesha Zahid Personal Dashboard';
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


// ROUTES
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.use(authRoutes);
app.use(dashboardRoutes);


// 404
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
});


// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', {
    pageTitle: 'Server Error',
    details: isProduction ? null : err.message
  });
});


// START SERVER
app.listen(PORT, () => {
  console.log(`${process.env.APP_TITLE || 'App'} running on port ${PORT}`);
});
