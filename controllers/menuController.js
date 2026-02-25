const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.find();
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a menu item (admin only)
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image } = req.body;
    const menuItem = await Menu.create({ name, description, price, image });
    res.status(201).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item (admin only)
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image } = req.body;
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image },
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item (admin only)
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};