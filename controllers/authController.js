const User = require('../models/User');

// Show login form
exports.getLogin = (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

// Handle login
exports.postLogin = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;
        
        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('No user found with email/username:', email);
            return res.render('auth/login', {
                title: 'Login',
                messages: { error: 'Invalid email/username or password' }
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            console.log('Password does not match for user:', user.username);
            return res.render('auth/login', {
                title: 'Login',
                messages: { error: 'Invalid email/username or password' }
            });
        }

        // Set user session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        console.log('Session set for user:', user.username);
        console.log('Session data:', req.session);

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', {
            title: 'Login',
            messages: { error: 'An error occurred during login' }
        });
    }
};

// Show registration form
exports.getRegister = (req, res) => {
    res.render('auth/register', { title: 'Register' });
};

// Handle registration
exports.postRegister = async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        const { username, email, password, confirmPassword } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            return res.render('auth/register', {
                title: 'Register',
                messages: { error: 'Passwords do not match' }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });

        if (existingUser) {
            console.log('User already exists:', existingUser.username);
            return res.render('auth/register', {
                title: 'Register',
                messages: { error: 'Username or email already exists' }
            });
        }

        // Create new user
        const user = new User({
            username,
            email: email.toLowerCase(),
            password
        });

        await user.save();
        console.log('New user created:', user.username);

        // Set user session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        console.log('Session set for new user:', user.username);
        console.log('Session data:', req.session);

        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('auth/register', {
            title: 'Register',
            messages: { error: 'An error occurred during registration' }
        });
    }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
}; 