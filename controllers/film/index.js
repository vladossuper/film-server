const Film = require('../../Models/Films');

const setFilmController = async (req, res) => {
  const { title, release_year, format, stars } = req.body;
  const newFilm = new Film({
    title,
    release_year,
    format,
    stars
  });
  await newFilm.save(err => {
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
};

const getFilmController = async (req, res, next) => {
  await Film.find({}, (err, films) => {
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
        films: films.sort((prev, next) => (prev.title != null ? prev.title : '').localeCompare((next.title != null ? next.title : '')))
      });
    }
  });
};

const deleteFilmController = async (req, res) => {
  const { _id } = req.body;
  Film.findOneAndDelete({ _id }, err => {
    if (err) return res.status(500).json({
      title: 'Server error',
      error: err
    });
    return res.status(200).json({
      title: 'Success',
    });
  });
};

module.exports = {
  setFilmController,
  getFilmController,
  deleteFilmController
};