//const express = require('https-localhost')
//const app = express()
//const port = 3000
const app = require("https-localhost")();
// app is an express app, do what you usually do with express
app.serve('./')
//app.listen(3000);

//app.use(express.static('./'))

//app.get('/', (req, res) => res.send('Hello World!'))

//app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

