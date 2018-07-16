module.exports = async function badRequest(msg){
    let res = this.res,
        req = this.req;

    let out = 'Bad request, try again. ',
        errors = await sails.helpers.simplifyErrors(msg);

    if (errors.code === 'E_MISSING_OR_INVALID_PARAMS') {
        out += errors.problems.join('; ');
    }

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: {chatMessage: out, errors: errors}});

    return res.json(out);
};
