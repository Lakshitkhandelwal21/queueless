const QueueEntry = require('../models/QueueEntry');
const QueueSession = require('../models/QueueSession');

// @desc    Get today operational KPIs
// @route   GET /api/analytics/today
// @access  Private (Admin, Staff)
const getTodayAnalytics = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessions = await QueueSession.find({ date: todayStr });
    const sessionIds = sessions.map((s) => s._id);

    const totalTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds } });
    const waitingTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'waiting' });
    const servingTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: { $in: ['called', 'serving'] } });
    const servedTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'served' });
    const noShowTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'no_show' });
    const cancelledTickets = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'cancelled' });

    // Calculate Average Wait Time (joinedAt -> calledAt) for served tickets
    const completedEntries = await QueueEntry.find({
      sessionId: { $in: sessionIds },
      status: 'served',
      calledAt: { $ne: null },
      joinedAt: { $ne: null },
    });

    let totalWaitMs = 0;
    completedEntries.forEach((entry) => {
      totalWaitMs += new Date(entry.calledAt) - new Date(entry.joinedAt);
    });

    const averageWaitMinutes = completedEntries.length > 0 ? Math.round(totalWaitMs / completedEntries.length / 60000) : 0;

    res.json({
      success: true,
      data: {
        totalTickets,
        waitingTickets,
        servingTickets,
        servedTickets,
        noShowTickets,
        cancelledTickets,
        noShowRate: totalTickets > 0 ? ((noShowTickets / totalTickets) * 100).toFixed(1) + '%' : '0%',
        cancellationRate: totalTickets > 0 ? ((cancelledTickets / totalTickets) * 100).toFixed(1) + '%' : '0%',
        averageWaitMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 7-day weekly metrics breakdown
// @route   GET /api/analytics/weekly
// @access  Private (Admin)
const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const weeklyData = [];

    for (const dateStr of dates) {
      const sessions = await QueueSession.find({ date: dateStr });
      const sessionIds = sessions.map((s) => s._id);

      const total = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds } });
      const served = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'served' });
      const noShow = await QueueEntry.countDocuments({ sessionId: { $in: sessionIds }, status: 'no_show' });

      weeklyData.push({
        date: dateStr,
        total,
        served,
        noShow,
      });
    }

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayAnalytics,
  getWeeklyAnalytics,
};
