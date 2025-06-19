require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config()

const userDatabase = {}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

function generateCustomId() {
  // Generate 20-digit number string
  let digits = '';
  while (digits.length < 20) {
    digits += Math.floor(Math.random() * 10); // adds one digit at a time
  }

  // Generate 4 random lowercase letters
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let word = '';
  for (let i = 0; i < 4; i++) {
    word += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return digits + word;
}


//Post /api/users to store username
app.post('/api/users', (req, res) => {
  const username = req.body.username

  //validate userName
  if (!username) {
    return res.status(400).json({
      error: 'Username is required'
    })
  }

  //Generate random 20 digits and 4 words ID
  const id = generateCustomId();

  userDatabase[id] = username;

  res.json({username: username,
  _id: id})
})

app.get('/api/users', (req, res) => {
  const users = Object.entries(userDatabase).map(([id, username]) => ({
    _id: id,
    username: username,
    __V:0
  }))
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const _id = req.params._id;
  // Validate user
  if (!userDatabase[_id]) {
    return res.status(400).json({ error: 'User does not exist' });
  }
  // Use current date if not provided
  const exerciseDate = date ? new Date(date) : new Date();
  // Ensure it's a valid date
  if (isNaN(exerciseDate)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  const formattedDate = exerciseDate.toDateString();
  // Create exercise object (optional: save to a separate database)
  const exercise = {
    _id,
    username: userDatabase[_id],
    description,
    duration: parseInt(duration),
    date: formattedDate
  };

  // Return the exercise (you can also store it in a DB if needed)
  res.json(exercise);
});


app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;

  // Validate user
  const username = userDatabase[_id];
  if (!username) {
    return res.status(400).json({ error: 'User not found' });
  }

  let logs = exerciseLogs[_id] || [];

  // Filter by 'from' and 'to' if provided
  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }

  // Apply limit if provided
  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    _id,
    username,
    count: logs.length,
    log: logs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: log.date
    }))
  });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
