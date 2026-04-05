const prisma = require('../utils/prisma');
const { composeDistressMessage } = require('../utils/gemini');

const ping = async (req, res) => {
  try {
    const { latitude, longitude, name, phone, lastDescription } = req.body;
    const userId = req.user.userId;

    await prisma.heartbeat.upsert({
      where: { userId },
      update: {
        lastSeen: new Date(),
        latitude,
        longitude,
        name,
        phone,
        isAlert: false
      },
      create: {
        userId,
        latitude,
        longitude,
        name,
        phone,
        isAlert: false
      }
    });

    res.status(200).json({ message: 'Heartbeat received' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const checkSilentUsers = async () => {
  try {
    const threshold = new Date(Date.now() - 60 * 1000); // 60 seconds

    const silentUsers = await prisma.heartbeat.findMany({
      where: {
        lastSeen: { lt: threshold },
        isAlert: false
      }
    });

    for (const user of silentUsers) {
      const message = await composeDistressMessage(
        user.name,
        user.phone,
        user.latitude,
        user.longitude,
        'User went silent'
      );

      console.log(`🚨 DEAD MAN'S SWITCH TRIGGERED for ${user.name}`);
      console.log(`📍 Last location: ${user.latitude}, ${user.longitude}`);
      console.log(`📢 Distress message: ${message}`);

      await prisma.heartbeat.update({
        where: { userId: user.userId },
        data: { isAlert: true }
      });
    }
  } catch (err) {
    console.error('Watchdog error:', err.message);
  }
};

module.exports = { ping, checkSilentUsers };