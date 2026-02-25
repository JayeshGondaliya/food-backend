const Order = require('../models/Order');

// Helper to get price safely (handles deleted items)
const calculateTotal = (items) => {
  return {
    $sum: {
      $map: {
        input: items,
        as: 'item',
        in: {
          $multiply: [
            '$$item.quantity',
            { $ifNull: ['$$item.menuItemId.price', 0] } // fallback to 0 if menu item missing
          ]
        }
      }
    }
  };
};

exports.getDailyAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) start.setDate(end.getDate() - 7);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // First, we need to populate the menuItemId to get prices.
    // Since aggregation cannot directly populate, we use $lookup.
    // We'll do a single aggregation pipeline with $lookup stages.

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      // Unwind items to work with each item individually
      { $unwind: '$items' },
      // Lookup menu details
      {
        $lookup: {
          from: 'menus',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } },
      // Group back by order to preserve order-level fields? Actually we need daily stats, so group by date.
      // Add a date field
      {
        $addFields: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          itemTotal: {
            $multiply: [
              '$items.quantity',
              { $ifNull: ['$menuItem.price', 0] }
            ]
          }
        }
      },
      // Group by date to get daily totals
      {
        $group: {
          _id: '$date',
          orders: { $addToSet: '$_id' }, // count distinct orders
          revenue: { $sum: '$itemTotal' }
        }
      },
      {
        $project: {
          _id: 1,
          orders: { $size: '$orders' },
          revenue: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular items – count quantities sold
    const popularItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menus',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: { $ifNull: ['$menuItem.name', 'Deleted Item'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    // Payment methods breakdown
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 }
        }
      }
    ]);

    // Overall totals
    const totals = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menus',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: {
            $sum: {
              $multiply: [
                '$items.quantity',
                { $ifNull: ['$menuItem.price', 0] }
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: { $size: '$totalOrders' },
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      daily: dailyStats,
      popularItems,
      paymentMethods,
      totals: totals[0] || { totalOrders: 0, totalRevenue: 0 },
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};