const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const Post = require('./models/Post');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

// Passport configuration
passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, user);
    }
));

passport.serializeUser ((user, done) => {
    done(null, user.id);
});

passport.deserializeUser (async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Public route for displaying articles
app.get('/', async (req, res) => {
    const posts = await Post.find({ publishDate: { $lte: new Date() } });
    res.render('index', { posts });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});