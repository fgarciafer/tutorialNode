import AuthorModel from '../schemas/author.schema.js';

export const getAuthors = async (req, res) => {

    const authors = await AuthorModel.find().sort('id');

    res.status(200).json({
        authors
    });
}

export const createAuthor = async (req, res) => {
    const { name, nationality } = req.body;
    const author = new AuthorModel({ name, nationality });

    try {
        const authorSaved = await author.save();
        res.status(200).json({
            author: authorSaved
        });
    } catch (err) {
        res.status(500).json({
            msg: 'Error creating author'
        });
    }
}

export const updateAuthor = async (req, res) => {
    const authorId = req.params.id;
    const author = await AuthorModel.findById(authorId);
    if (!author) {
        return res.status(404).json({
            msg: 'There is no author with that Id'
        });
    }

    await AuthorModel.findByIdAndUpdate(authorId, req.body, { new: true });
    res.status(200).json(1);
}

export const deleteAuthor = async (req, res) => {
    const authorId = req.params.id;
    try {
        const author = await AuthorModel.findById(authorId);

        if (!author) {
            return res.status(404).json({
                ok: false,
                msg: 'There is no author with that Id'
            });
        }
        const deletedAuthor = await AuthorModel.findByIdAndDelete(authorId);
        res.status(200).json({
            author: deletedAuthor
        });
    } catch (err) {
        res.status(500).json({
            msg: 'Error deleting author'
        });
    }
}

export const getAuthorsPageable = async (req, res) => {
    const page = req.body.pageable.pageNumber || 0;
    const limit = req.body.pageable.pageSize || 5;
    const sort = {
        [req.body.pageable.sort?.property || 'name']: req.body.pageable.sort?.direction === 'DESC' ? 'DESC' : 'ASC'
    };

    const options = {
        page: parseInt(page) + 1,
        limit,
        sort
    };

    const response = await AuthorModel.paginate({}, options);

    res.status(200).json({
        content: response.docs,
        pageable: {
            pageNumber: response.page - 1,
            pageSize: response.limit,
            totalElements: response.totalDocs
        }
    });
}

