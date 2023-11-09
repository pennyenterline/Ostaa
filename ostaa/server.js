// Author: Penny Enterline
// JS express server that accesses a mongodb

// constants
const express = require('express')
const parser = require('body-parser');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const app = express();

const port = 3000;

app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// session
let sessions = {};

// adds user to session
function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = { id: sid, time: now };
  return sid;

}

// clears sessions
function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if (last + 20000 < now) {
      delete sessions[usernames[i]];
    }
  }
}

// auth
function authenticate(req, res, next) {
  let cookie = req.cookies;
  if (cookie != undefined &&
    sessions[cookie.login] != undefined &&
    sessions[cookie.login.username].id == cookie.login.sessionID) {
    next();
  } else {
    res.redirect('/index.html');
  }
}

setInterval(removeSessions, 2000);

// mongo connection
mongoose.connect('mongodb://127.0.0.1/Ostaa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const Schema = mongoose.Schema;

// mongo scheema user
const UserSchema = new Schema({
  username: String,
  password: String,
  listings: [],
  purchases: []
});

// mongo scheema item
const ItemSchema = new Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String
});

const UserData = mongoose.model('UserData', UserSchema);
const ItemData = mongoose.model('ItemData', ItemSchema);

app.use(express.static('public_html'));
app.use("/public_html/home.html", authenticate);

// homepage
app.get('/', async (req, res) => {
  res.render('index');
});

// return JSON array containing all user in database
app.get('/get/users/', async (req, res) => {

  let users = []

  UserData.find({}).then((users) => {
    res.status(200).json(users)

  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })

})

// checks a user exists in data
app.post('/login', async (req, res) => {

  let users = []

  let user = req.body.username
  let pass = req.body.password

  let foundUser = await UserData.findOne({ username: user, password: pass }).exec();

  let usersObj = JSON.stringify(foundUser);

  let cookies = res.req.cookies.username;

  res.send(usersObj);

  return;

});

// return JSON array containing all item in database
app.get('/get/items/', async (req, res) => {

  let items = []

  ItemData.find({}).then((items) => {
    res.status(200).json(items)
  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })

})

// return JSON array containing all listings for username
app.get('/get/listings/:USERNAME', async (req, res) => {

  let users = []
  let items = []

  console.log(req.session)

  UserData.find({ username: req.params.USERNAME }).then((users) => {
    let listing = users[0].listings
    ItemData.find({ _id: { $in: listing } }).then((items) => {
      res.status(200).json(items)
    })

  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })

})

// return JSON array containing all purchases for username
app.get('/get/purchases/:USERNAME', async (req, res) => {

  let users = []
  let items = []

  UserData.find({ username: req.params.USERNAME }).then((users) => {
    let purchase = users[0].purchases
    ItemData.find({ _id: { $in: purchase } }).then((items) => {
      res.status(200).json(items)
    })
  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })
})

// return JSON array containing all user in database
app.get('/search/users/:KEYWORD', async (req, res) => {

  let users = []

  UserData.find({ username: { $regex: req.params.KEYWORD } }).then((users) => {
    res.status(200).json(users)
  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })
})

// return JSON array containing all item in database
app.get('/search/items/:KEYWORD', async (req, res) => {

  let items = []

  ItemData.find({ description: { $regex: req.params.KEYWORD } }).then((items) => {
    res.status(200).json(items)
  })
    .catch(() => {
      res.status(500).json({ error: 'error' })
    })
})

// sends user data to mongodb
app.post('/add/user/', function (req, res) {
  let newUserData = new UserData({
    username: req.body.username,
    password: req.body.password,
    listings: [],
    purchases: []
  });
  newUserData.save();
  res.redirect('/');
})

// sends item data to mongodb
app.post('/add/item/:USERNAME', function (req, res) {
  console.log("title: " + req.body.title);
  console.log("price: " + req.body.price);
  let newItemData = new ItemData({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    price: req.body.price,
    stat: req.body.stat
  });

  let id = newItemData._id.toString();
  let user = req.params.USERNAME

  updateListing(user, id)

  newItemData.save();

  res.redirect('/');
})

// updates user listings in userdb
const updateListing = async (user, id) => {
  let result = await UserData.updateOne(
    { username: user },
    { $push: { listings: id } }
  )
}

// updates user purchases in userdb and in itemdb
app.post('/buy', async function (req, res) {

  let username = req.body.username;
  let itemId = req.body.itemId;

  try {

    let user = await UserData.findOne({ username: username });
    let userPurchases = user.purchases;
    userPurchases.push(itemId);

    await ItemData.updateOne(
      { _id: itemId },
      { $set: { stat: 'SOLD' } },
    ).exec();

    await UserData.updateOne(
      { username: username },
      { $set: { purchases: userPurchases } }
    ).exec();

    return res.send({ text: 'Item purchased successfully' });
  } catch (err) {
    return res.status(500).send('Failed to purchase item');
  }
})

app.listen(port, () =>
  console.log(
    `Example app listening at http://localhost:${port}`));
