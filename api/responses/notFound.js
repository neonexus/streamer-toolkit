module.exports = async function notFound(msg){
    let req = this.req,
        res = this.res;

    if (!msg) {
        msg = 'Could not locate requested item';
    }

    let out = {
        success: false,
        errors: await sails.helpers.simplifyErrors(msg),
        errorMessages: await sails.helpers.getErrorMessages(msg)
    };

    res.status(404);

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: out});

    return res.json(out);
};
