const prisma = require('../utils/prisma');

const reportSafeZone = async (req, res) => {
  try {
    const { description, latitude, longitude, type } = req.body;
    const reportedBy = req.user.userId;

    const zone = await prisma.safeZone.create({
      data: { reportedBy, description, latitude, longitude, type }
    });

    res.status(201).json({ message: 'Safe zone reported', zone });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSafeZones = async (req, res) => {
  try {
    const zones = await prisma.safeZone.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(zones);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const verifySafeZone = async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await prisma.safeZone.update({
      where: { id },
      data: { isVerified: true }
    });

    res.status(200).json({ message: 'Safe zone verified', zone });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { reportSafeZone, getSafeZones, verifySafeZone };