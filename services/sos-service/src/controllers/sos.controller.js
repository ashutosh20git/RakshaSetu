const prisma = require('../utils/prisma');
const { classifyEmergency } = require('../utils/gemini');

const triggerSos = async (req, res) => {
  try {
    const { latitude, longitude, description } = req.body;
    const userId = req.user.userId;

    let classification = {
      emergencyType: 'OTHER',
      severity: 'HIGH',
      routedTo: 'VOLUNTEER'
    };

    if (description) {
      classification = await classifyEmergency(description);
    }

    const sos = await prisma.sosEvent.create({
      data: {
        userId,
        latitude,
        longitude,
        description,
        emergencyType: classification.emergencyType,
        severity: classification.severity,
        routedTo: classification.routedTo
      }
    });

    res.status(201).json({ message: 'SOS triggered', sos });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getNearbySos = async (req, res) => {
  try {
    const allSos = await prisma.sosEvent.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(allSos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { triggerSos, getNearbySos };