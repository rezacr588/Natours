class ApiFeutures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filter A
    let queryObj = { ...this.queryString };
    const deletedFields = ['limit', 'page', 'sort', 'fields'];
    deletedFields.forEach((e) => delete queryObj[e]);
    // 1) Filter B
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort;
    if (sortBy) {
      const sortStatement = sortBy.split(',').join(' ');
      this.query = this.query.sort(sortStatement);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  poject() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeutures;
