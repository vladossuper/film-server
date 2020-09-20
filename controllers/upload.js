const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Film = require('../Models/Films');

const uploadController = (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const file = req.files.file;

  const reqPath = path.join(__dirname, `../files/${file.name}`);
  file.mv(reqPath, err => {

    if (err) {
      return res.status(500).send(err);
    };

    fs.access(reqPath, error => {
      if (!error) {
        const string = fs.readFileSync(reqPath).toString();

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
            if (!title.startsWith(h1) || !releaseYear.startsWith(h2) || !format.startsWith(h3) || !stars.startsWith(h4)) {
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
          result.map(({ title, releaseYear, format, stars }) => {
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
        console.error('NOT OK')
      }
    });
  });
};

module.exports = uploadController;