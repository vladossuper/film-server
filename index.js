const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const User = require('./models/User');
const Film = require('./Models/Films');

mongoose.connect('mongodb+srv://admin:admin@cluster0-o6nle.mongodb.net/film?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: true })
.then(() =>{
    console.log('DB Connected!')
})
.catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.post('/register', (req, res, next) => {
    const { name, surname, email, password } = req.body;
    const newUser = new User({
        email: email,
        name: name,
        surname: surname,
        password: bcrypt.hashSync(password, 10)
    })
    newUser.save(err => {
        if (err) {
          return res.status(400).json({
              title: 'error',
              error: 'email in use'
          })
        }
        return res.status(200).json({
            title: 'signup success'
        })
    })
})

app.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err) return res.status(500).json({
          title: 'server error',
          error: err
        })
        if (!user) {
          return res.status(401).json({
              title: 'user not found',
              error: 'invalid credentials'
          })
        }
        //incorrect password
        if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
            titte: 'login failed',
            error: 'invalid credentials'
        })
        }
        //IF ALL IS GOOD create a token and send to frontend
        let token = jwt.sign({ userId: user._id}, 'secretkey');
        return res.status(200).json({
          title: 'login sucess',
          token: token
        })
    })
});

// app.post('/details', (req, res, next) => {
//     const {  }
// })

app.post('/set-film', (req, res, next) => {
    const { title, release_year, format, stars } = req.body;
    const newFilm = new Film({
        title,
        release_year,
        format,
        stars
    });
    newFilm.save(err => {
        if (err) {
          return res.status(500).json({
              title: 'error',
              error: 'email in use'
          })
        };
        return res.status(200).json({
            title: 'save success'
        })
    });
});

app.post('/get-films', (req, res, next) => {
    Film.find({}, (err, films) => {
        if (err) return res.status(500).json({
            title: 'Server Error',
            error: err
        });
        if (films.length === 0) {
            return res.status(204).json({
                title: 'No Content'
            });
        } else {
            return res.status(200).json({
                title: 'Success',
                films: films.sort((prev, next) => prev.title.localeCompare(next.title))
            });
        }
        
    });
});

app.post('/delete-film', (req, res, next) => {
    const { _id } = req.body;
    Film.findOneAndDelete({ _id }, (err, film) => {
        if (err) return res.status(500).json({
            title: 'Server error',
            error: err
        });
        if (!film) return res.status(401).json({
            title: 'Film nit found',
            error: err
        });
        return res.status(200).json({
            title: 'Success',
        })
    });
});

app.post('/search', (req, res, next) => {
    const { search } = req.body;
    Film.find({ title: new RegExp(search, 'i') }, (err, result) => {
        if (err) return res.status(500).json({
            title: 'Error title',
            error: err
        });
        if (result.length === 0) {
            Film.find({ stars: new RegExp(search, 'i') }, (err, result) => {
                if (err) return res.status(500).json({
                    title: 'Error stars',
                    error: err
                });
                if (result.length === 0) return res.status(204).json({
                    title: 'No Content',
                });
                if (result.length > 0) res.status(200).json({
                    title: 'Success',
                    result
                })
            });
        }
        if (result.length > 0) return res.status(200).json({
            title: 'Success',
            result
        });
    })
});

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log('server running on port ' + port);
});