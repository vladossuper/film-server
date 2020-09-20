const Film = require('../Models/Films');

const searchController = async (req, res, next) => {
  const { search } = req.body;
  await Film.find({ title: new RegExp(search, 'i') }, (err, result) => {
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
        });
      });
    };
    if (result.length > 0) return res.status(200).json({
      title: 'Success',
      result
    });
  });
};

module.exports = searchController;