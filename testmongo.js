const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uri ='mongodb+srv://ae:cs5UYjwsPfdQPnRd@cluster0.lrsulsa.mongodb.net/MyDBexample?retryWrites=true&w=majority';

const client = new MongoClient(uri);

// Default endpoint
app.get('/', (req, res) => {
    if (req.cookies.auth) {
        res.send(`Authentication cookie exists with value: ${req.cookies.auth}<br><a href="/cookies">View Cookies</a> | <a href="/clear-cookie">Clear Cookie</a>`);
    } else {
        res.send('<a href="/login">Click Login</a> | <a href="/register">Click Register</a>');
    }
});

// Login endpoint
app.get('/login', (req, res) => {
    res.send('<form method="post" action="/login">\
                <input type="text" name="user_ID" placeholder="User ID"><br>\
                <input type="password" name="password" placeholder="Password"><br>\
                <input type="submit" value="Login">\
              </form>');
});

app.post('/login', async (req, res) => {
    const { user_ID, password } = req.body;
    const database = client.db('MyDBexample');
    const users = database.collection('Users');
    const user = await users.findOne({ user_ID, password });
    if (user) {
        res.cookie('auth', 'authenticated', { maxAge: 60000 });
        res.redirect('/');
    } else {
        res.send('User credntials are invalid. <a href="/">Back to homepage</a>');
    }
});

// Register endpoint
app.get('/register', (req, res) => {
    res.send('<form method="post" action="/register">\
                <input type="text" name="user_ID" placeholder="User ID"><br>\
                <input type="password" name="password" placeholder="Password"><br>\
                <input type="submit" value="Register">\
              </form>');
});

app.post('/register', async (req, res) => {
    const { user_ID, password } = req.body;
    const database = client.db('MyDBexample');
    const users = database.collection('Users');
    await users.insertOne({ user_ID, password });
    res.send('User register was successful. <a href="/">Go back to homepage</a>');
});

// View Cookies endpoint
app.get('/cookies', (req, res) => {
    res.send(`All active cookies: ${JSON.stringify(req.cookies)}<br><a href="/">Back to homepage</a>`);
});

// Clear Cookie endpoint
app.get('/clear-cookie', (req, res) => {
    res.clearCookie('auth');
    res.send('All cookie cleared successfully. <a href="/">Go back to homepage</a>');
});
