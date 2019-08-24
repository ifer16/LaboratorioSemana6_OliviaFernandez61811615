const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const app = express();
const config = ('./config.js')
const User = require('./models/user');
const middleware = require('./middleware');
const service = require('./service');


mongoose.connect('mongodb://localhost:27017/token', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos online');
});

app.set('superSecret', config.secret)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride())


app.get('/', (req, res) => {
    res.send('Hola! API: http://localhost:3000/api')
})

app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
})


app.get('/setup', (req, res) => {
    let nick = new User({
        name: 'Isabelle',
        password: 'ifer16',
        admin: true
    })

    nick.save(function(err) {
        if (err) throw err;

        console.log('Usuario guardado exitosamente');
        res.json({ success: true })
    })
})


const apiRoutes = express.Router()

apiRoutes.get('/', (req, res) => {
    res.json({ message: 'Bienvenido al api de programacion.com.py :)' });
});

apiRoutes.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users)
    })
})

apiRoutes.post('/authenticate', (req, res) => {

    User.findOne({
        name: req.body.name
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: service.createToken(user)
                });
            }
        }
    });
});



apiRoutes.get('/private', middleware.ensureAuthenticated, (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    res.json({ message: `Estás autenticado correctamente y tu _id es: ${req.user}` });
});

app.use('/api', apiRoutes);