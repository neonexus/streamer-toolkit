module.exports = async function serverError(msg){
    let req = this.req,
        res = this.res;

    if (!msg) {
        msg = 'Unknown server error occurred';
    }

    let out = {
        success: false,
        errors: await sails.helpers.simplifyErrors(msg),
        errorMessages: await sails.helpers.getErrorMessages(msg)
    };

    res.status(500);

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: out});

    return res.json(out);
};
