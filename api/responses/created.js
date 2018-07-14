module.exports = async function created(data){
    let res = this.res,
        req = this.req;

    if (!data) {
        data = {};
    }

    if (typeof data === 'string') {
        data = {message: data};
    }

    // force all objects to their JSON formats, if it has said function
    // this prevents accidental leaking of sensitive data, by utilizing customToJSON on models
    (function findTheJson(data){
        _.forEach(data, function(val, key){
            if (_.isObject(val)) {
                findTheJson(val);
            }

            if (val && val.toJSON && typeof val.toJSON === 'function') {
                data[key] = val.toJSON();
            }
        });
    })(data);

    res.status(201);

    let out = _.merge({success: true}, data);

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: out});

    return res.json(out);
};
