module.exports = async function badRequest(msg){
    let res = this.res,
        req = this.req;

    if (!msg) {
        msg = 'Could not understand request';
    }

    let out = {
        success: false,
        errors: await sails.helpers.simplifyErrors(msg),
        errorMessages: await sails.helpers.getErrorMessages(msg)
    };

    res.status(400);

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: out});

    return res.json(out);
};
