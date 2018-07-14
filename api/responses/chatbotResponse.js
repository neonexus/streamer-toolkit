module.exports = async function chatbotResponse(data){
    let res = this.res,
        req = this.req;

    if (!data) {
        data = 'Something didn\'t go as planned...';
    }

    await sails.helpers.finalizeRequestLog.with({req: req, res: res, body: {plainString: data}});

    return res.json(data);
};
