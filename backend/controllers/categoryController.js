import Category from '../models/Category.js';

const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, active } = req.body;
    const exists = await Category.findOne({ slug });
    if (exists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }
    const cat = await Category.create({ name, slug, description, image, active });
    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    Object.assign(cat, req.body);
    const updated = await cat.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    await cat.remove();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { listCategories, createCategory, updateCategory, deleteCategory };
