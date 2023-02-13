import CategoryModel from '../schemas/category.schema.js';

export const getCategories = async (req, res) => {

    const categories = await CategoryModel.find().sort('name');

    res.status(200).json(
        categories
    );
}

export const createCategory = async (req, res) => {
    const { name } = req.body;
    const category = new CategoryModel({ name });

    try {
        const categorySaved = await category.save();
        res.status(200).json({
            category: categorySaved
        });
    } catch (err) {
        res.status(500).json({
            msg: 'Error creating category'
        });
    }
}

export const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
        return res.status(404).json({
            msg: 'There is no category with that Id'
        });
    }

    await CategoryModel.findByIdAndUpdate(categoryId, req.body, { new: true });
    res.status(200).json(1);
}

export const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await CategoryModel.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                ok: false,
                msg: 'There is no category with that Id'
            });
        }
        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
        res.status(200).json({
            category: deletedCategory
        });
    } catch (err) {
        res.status(500).json({
            msg: 'Error deleting category'
        });
    }
}


