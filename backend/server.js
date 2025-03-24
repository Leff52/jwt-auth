const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
const app = express()
const PORT = 3000
app.use(express.static('frontend'))
app.use(bodyParser.json())
app.use(cors())
// Пользователи 
let users = []

// Маршрут регистрации
app.post('/register', (req, res) => {
	const { username, password } = req.body

	// Проверка
	if (users.find(u => u.username === username)) {
		return res.status(400).json({ message: 'User already exists' })
	}
	const newUser = { id: users.length + 1, username, password }
	users.push(newUser)

	res.status(201).json({ message: 'User registered successfully' })
})

// Маршрут входа
app.post('/login', (req, res) => {
	const { username, password } = req.body
	const user = users.find(
		u => u.username === username && u.password === password
	)

	if (user) {
		// Генерация JWT токена 
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
			expiresIn: '10s',
		})
		res.json({ token })
	} else {
		res.status(401).json({ message: 'Invalid credentials' })
	}
})

const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (authHeader) {
		const token = authHeader.split(' ')[1]

		jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
			if (err) {
				return res.sendStatus(403)
			}
			req.user = user
			next()
		})
	} else {
		res.sendStatus(401)
	}
}

// Защищенный маршрут
app.get('/protected', authenticateJWT, (req, res) => {
	res.json({ message: 'This is a protected route', user: req.user })
})
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
