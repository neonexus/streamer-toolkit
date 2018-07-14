module.exports = async function forbidden(msg){
    let res = this.res,
        req = this.req;

    if (!msg) {
        msg = 'You are not permitted to perform this action.';
    }

    let out = {
        success: false,
        errors: await sails.helpers.simplifyErrors(msg),
        errorMessages: await sails.helpers.getErrorMessages(msg)
    };

    res.status(403);

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: out});

    return res.json(out);
};
