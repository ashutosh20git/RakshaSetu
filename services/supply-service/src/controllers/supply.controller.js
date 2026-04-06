const prisma = require('../utils/prisma');
const { rankUrgency } = require('../utils/gemini');

const createRequest = async (req, res) => {
  try {
    const { type, description, latitude, longitude } = req.body;
    const userId = req.user.userId;

    const { urgency, category } = await rankUrgency(type, description);

    const request = await prisma.supplyRequest.create({
      data: {
        userId,
        type,
        description,
        urgency,
        category,
        latitude,
        longitude
      }
    });

    res.status(201).json({ message: 'Supply request created', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await prisma.supplyRequest.findMany({
      where: { status: 'OPEN' },
      orderBy: { urgency: 'desc' }
    });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.supplyRequest.update({
      where: { id },
      data: { status: 'FULFILLED' }
    });

    res.status(200).json({ message: 'Request fulfilled', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createRequest, getRequests, fulfillRequest };