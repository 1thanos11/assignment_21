"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options, }) {
        const [doc] = (await this.create({ data: [data], options })) || [];
        return doc;
    }
    async findOne({ filter, projection, options, }) {
        const query = this.model.findOne(filter, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean)
            query.lean(options.lean);
        return await query.exec();
    }
    async find({ filter, projection, options, }) {
        const query = this.model.find(filter, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean)
            query.lean(options.lean);
        if (options?.skip)
            query.skip(options.skip);
        if (options?.limit)
            query.limit(options.limit);
        return await query.exec();
    }
    async findById({ _id, projection, options, }) {
        const query = this.model.findById(_id, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean)
            query.lean(options.lean);
        return await query.exec();
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, { ...options, runValidators: true });
    }
    async updateMany({ filter, update, options, }) {
        return await this.model.updateMany(filter, { ...update, $inc: { __v: 1 } }, { ...options, runValidators: true });
    }
    async findOneAndUpdate({ filter, update, options, }) {
        if (Array.isArray(update)) {
            return this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, {
                ...options,
                runValidators: true,
                returnDocument: "after",
                updatePipeline: true,
            });
        }
        return this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, { ...options, runValidators: true, returnDocument: "after" });
    }
    async findOneAndDelete({ filter, }) {
        return this.model.findOneAndDelete(filter);
    }
    async findByIdAndUpdate({ _id, update, options = { returnDocument: "after" }, }) {
        return this.model.findByIdAndUpdate(_id, { ...update, $inc: { __v: 1 } }, { ...options, runValidators: true, returnDocument: "after" });
    }
    async findByIdAndDelete({ _id, }) {
        return this.model.findByIdAndDelete(_id);
    }
    async deleteOne({ filter, options, }) {
        return await this.model.deleteOne(filter, options);
    }
    async deleteMany({ filter, options, }) {
        return await this.model.deleteMany(filter, options);
    }
    async paginate({ filter, projection, options = {}, page = 1, size = 10, }) {
        let count = -1;
        if (Number(page) > 0) {
            page = parseInt(page);
            size = parseInt(size);
            options.skip = (page - 1) * size;
            options.limit = size;
            count = await this.model.countDocuments(filter);
        }
        const docs = await this.find({ filter: filter || {}, projection, options });
        return {
            docs,
            ...(Number(page) > 0
                ? {
                    currentPage: page,
                    size,
                    pages: Math.ceil(count / parseInt(size)),
                }
                : {}),
        };
    }
}
exports.DataBaseRepository = DataBaseRepository;
