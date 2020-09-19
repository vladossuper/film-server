const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const fs = require('fs');

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
app.use(fileUpload());

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
    console.log(newFilm);
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
        return res.status(200).json({
            title: 'Success',
        });
    });
});

app.post('/search', (req, res, next) => {
    const { search } = req.body;
    Film.find({ title: new RegExp(search, 'i') }, (err, result) => {
        console.log(result);
        if (err) return res.status(500).json({
            title: 'Error title',
            error: err
        });
        if (result.length === 0) {
            Film.find({ stars: new RegExp(search, 'i') }, (err, result) => {
                console.log(result);
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

app.post('/upload', (req, res) => {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const file = req.files.file;
    file.mv(`${__dirname}/${file.name}`, err => {
        if (err) {
            return res.status(500).send(err);
        };

        fs.access(file.name, error => {
            if (!error) {
                const string = fs.readFileSync(file.name).toString();

                const parse = file => {
                    const lines = file.split('\r\n');
                
                    const headers = ['Title: ', 'Release Year: ', 'Format: ', 'Stars: '];
                    const [h1, h2, h3, h4] = headers;
                    const splitterLength = 1;
                
                    const recursiveParse = (lines, acc) => {
                        const [first, restOfFile] = [lines.slice(0, 5), lines.slice(5)];
                
                        
                        if (!(first.length === headers.length || first.length === headers.length + splitterLength)) {
                            throw new Error('Wrong block format: ' + first.join('\n'));
                        }
                
                        const [title, releaseYear, format, stars, splitter] = first;
                        if (!title.startsWith(h1) || !releaseYear.startsWith(h2) || !format.startsWith(h3) || !stars.startsWith(h4)
                        ) {
                            throw new Error('Wrong Record format: ' + first.join('\n'));
                        }
                
                        acc.push({
                            title: title.slice(h1.length),
                            releaseYear: releaseYear.slice(h2.length),
                            format: format.slice(h3.length),
                            stars: stars.slice(h4.length)
                        })
                
                        if (restOfFile.length === 0) {
                            return acc;
                        } else {
                            return recursiveParse(restOfFile, acc);
                        }
                    }
                
                    return recursiveParse(lines, []);
                };

                const result = parse(string);

                let counter = 0;
                if (result.length > 0) {
                    result.map(data => {
                        const { title, releaseYear, format, stars } = data;
                        const newFilm = new Film({
                            title,
                            release_year: releaseYear,
                            format,
                            stars
                        });
                        newFilm.save(err => {
                            if (err) {
                                console.log(error);
                            }
                            counter += 1;
                            if (counter == result.length) res.status(200).json({
                                title: 'Success'
                            })
                        });
                    })
                }
                
            } else {
                console.log('NOT OK')
            }
        });
    });
});
const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log('server running on port ' + port);
});