const { sequelize, Generation, Feedback } = require('../models');
const { Op } = require('sequelize');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Generations
    const totalGenerations = await Generation.count({ where: { userId } });

    // 2. Average Rating & Likes
    const feedbackStats = await Feedback.findAll({
      include: [
        {
          model: Generation,
          as: 'generation',
          where: { userId },
          attributes: []
        }
      ],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('Feedback.id')), 'totalFeedback'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN liked = true THEN 1 ELSE 0 END')), 'totalLikes']
      ],
      raw: true
    });

    const avgRating = feedbackStats[0]?.avgRating ? parseFloat(parseFloat(feedbackStats[0].avgRating).toFixed(1)) : 0;
    const totalFeedback = feedbackStats[0]?.totalFeedback ? parseInt(feedbackStats[0].totalFeedback, 10) : 0;
    const totalLikes = feedbackStats[0]?.totalLikes ? parseInt(feedbackStats[0].totalLikes, 10) : 0;

    // 3. Most Used Routes
    const routeStats = await Generation.findAll({
      where: { userId },
      attributes: [
        'routeFrom',
        'routeTo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['routeFrom', 'routeTo'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true
    });

    // 4. Most Used AI Model
    const modelStats = await Generation.findAll({
      where: { userId },
      attributes: [
        ['selected_model', 'model'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['selected_model'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true
    });

    // 5. Daily Generation Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = await Generation.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM-DD'), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('to_char', sequelize.col('created_at'), 'YYYY-MM-DD')],
      order: [[sequelize.literal('date'), 'ASC']],
      raw: true
    });

    // 6. Average Response Time
    const avgResponseTimeResult = await Generation.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('response_time_ms')), 'avgResponseTime']
      ],
      raw: true
    });
    const avgResponseTimeMs = avgResponseTimeResult[0]?.avgResponseTime ? Math.round(parseFloat(avgResponseTimeResult[0].avgResponseTime)) : 0;

    // 7. Risk Level Breakdown
    const allGenerations = await Generation.findAll({
      where: { userId },
      attributes: ['aiResponse'],
      raw: true
    });

    let lowRisk = 0;
    let moderateRisk = 0;
    let highRisk = 0;

    for (const gen of allGenerations) {
      const text = gen.aiResponse || '';
      const tagMatch = text.match(/\[OVERALL_RISK_FACTOR\]:\s*(Low Risk|Moderate Risk|High Risk)/i);
      if (tagMatch) {
        const val = tagMatch[1].toLowerCase();
        if (val.includes('low')) lowRisk++;
        else if (val.includes('moderate')) moderateRisk++;
        else if (val.includes('high')) highRisk++;
      } else {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('high risk') || lowerText.includes('severe risk')) {
          highRisk++;
        } else if (lowerText.includes('moderate risk') || lowerText.includes('moderate precaution')) {
          moderateRisk++;
        } else if (lowerText.includes('low risk') || lowerText.includes('minimal risk')) {
          lowRisk++;
        } else {
          moderateRisk++;
        }
      }
    }

    return res.json({
      totalGenerations,
      avgRating,
      totalFeedback,
      totalLikes,
      avgResponseTimeMs,
      routes: routeStats.map(r => ({
        route: `${r.routeFrom} ➔ ${r.routeTo}`,
        count: parseInt(r.count, 10)
      })),
      models: modelStats.map(m => ({
        model: m.model,
        count: parseInt(m.count, 10)
      })),
      dailyTrends: dailyTrends.map(d => ({
        date: d.date,
        count: parseInt(d.count, 10)
      })),
      riskFactors: {
        low: lowRisk,
        moderate: moderateRisk,
        high: highRisk
      }
    });

  } catch (error) {
    console.error('Get Analytics Error:', error);
    return res.status(500).json({ error: 'An error occurred compiling analytics data.' });
  }
};
