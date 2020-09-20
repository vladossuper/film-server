const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const filmRouter = require('./routes/film');
const searchRouter = require('./routes/search');
const uploadRouter = require('./routes/upload');

mongoose.connect('mongodb+srv://admin:admin@cluster0-o6nle.mongodb.net/film?retryWrites=true&w=majority',
{ 
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true 
})
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
app.use('/', filmRouter);
app.use('/', searchRouter);
app.use('/', uploadRouter);

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log('server running on port ' + port);
});