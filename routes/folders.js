'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Folder = require('../models/folder');
const Note = require('../models/note');

router.get('/folders', (req, res, next) => {

  Folder.find({})
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(next);

});

router.get('/folders/:id', (req, res, next) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(next);

});

router.post('/folders', (req, res, next) => {

  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = { name };

  Folder.create(newFolder)
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

router.put('/folders/:id', (req, res, next) => {

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

  const updateFolder = { name };

  Folder.findByIdAndUpdate(id, updateFolder, { new: true })
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

router.delete('/folders/:id', (req, res, next) => {

  const { id } = req.params;

  const removeFolder = Folder.findByIdAndRemove({ _id: id });
  const removeNotes = Note.updateMany(
    { folderId: id },
    { '$unset': { 'folderId': '' } }
  );

  Promise.all([removeFolder, removeNotes])
    .then(() => {
      res.status(204).end();
    })
    .catch(next);

});



module.exports = router;