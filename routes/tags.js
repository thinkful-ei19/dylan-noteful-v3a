const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tag');
const Note = require('../models/note');

router.get('/tags', (req, res, next) => {

  Tag.find({})
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(next);

});

router.get('/tags/:id', (req, res, next) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(next);

});

router.post('/tags', (req, res, next) => {

  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

router.put('/tags/:id', (req, res, next) => {

  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateTag = { name };
  const options = { new: true };

  Tag.findByIdAndUpdate(id, updateTag, options)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

router.delete('/tags/:id', (req, res, next) => {

  const { id } = req.params;

  const removeTag = Tag.findByIdAndRemove({ _id: id });
  const removeTagFromNotes = Note.updateMany(
    {},
    { '$pull': { 'tags': { '$in': [id] } } }
  );

  Promise.all([removeTag, removeTagFromNotes])
    .then(() => {
      res.status(204).end();
    })
    .catch(next);

});

module.exports = router;