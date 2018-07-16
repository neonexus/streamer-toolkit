module.exports = async function(req, res, proceed){
    let token = req.param('securityToken');

    if (token !== sails.config.botisimo.customSecurityToken) {
        return res.forbidden('Your identity can\'t be verified. Is securityToken missing from the request?');
    }

    return proceed();
};
