module.exports = {

    friendlyName: 'Get error messages',

    description: '',

    inputs: {
        err: {
            type: 'ref'
        }
    },

    exits: {},

    fn: async function(inputs, exits){
        let errors = [],
            err = inputs.err;

        if (err) {
            if (err.invalidAttributes && err.Errors) {
                err = _.merge({}, err.invalidAttributes, err.Errors);

                utils.objForEach(err, function(error){
                    error.forEach(function(errMessage){
                        errors.push(errMessage.message);
                    });
                });
            } else if (err.invalidAttributes) {
                utils.objForEach(err.invalidAttributes, function(error){
                    error.forEach(function(errMessage){
                        errors.push(errMessage.message);
                    });
                });
            } else if (err.Errors) {
                utils.objForEach(err.Errors, function(error){
                    error.forEach(function(errMessage){
                        errors.push(errMessage.message);
                    });
                });
            } else if (err.message) { // Twilio errors
                errors = [err.message];
            } else {
                if (typeof err === 'string') {
                    errors = [err];
                } else {
                    errors = err;
                }
            }
        }

        return exits.success(errors);
    }

};

