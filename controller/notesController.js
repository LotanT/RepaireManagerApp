const User = require('../models/Users');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean().exec();
  if (!notes?.length) {
    return res.status(400).send({ message: 'No notes found' });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );
  res.json(notesWithUser);
});

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  if (!user || !title || !text) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate note title' });
  }
  console.log('before');
  try {
    const note = await Note.create({ user, title, text });
  } catch (err) {
    console.log(err);
  }
  console.log('after');
  if (note) {
    res.status(201).json({ message: `The Note ${title} has created` });
  } else {
    res.status(401).json({ message: 'Invalid note data received' });
  }
});

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const note = await Note.findById({ _id: id }).exec();
  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate note title' });
  }

  note.title = title;
  note.user = user;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} updated` });
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).send({ message: 'Note id require' });
  }
  const note = await Note.findById({ _id: id }).lean().exec();
  if (!note) {
    return res.status(400).send({ message: 'No note found' });
  }

  const result = await note.deleteOne();

  const reply = `Note ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
