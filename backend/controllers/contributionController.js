const Contribution = require('../models/Contribution');

exports.createContribution = async (req, res) => {
  try {
    const contribution = await Contribution.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json(contribution);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create contribution' });
  }
};

exports.getContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user._id }).sort({ contributionDate: -1 });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contributions' });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    res.json(contribution);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update contribution' });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    res.json({ message: 'Contribution deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete contribution' });
  }
};
