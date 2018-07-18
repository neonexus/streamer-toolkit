module.exports = {
    friendlyName: 'Get Option',

    description: 'Get the stored option from the database, otherwise returns "undefined".',

    inputs: {
        name: {
            description: 'The name of the option to retrieve.',
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits) {
        let option = await Option.findOne({name: inputs.name});

        if (!option) {
            return exits.success(undefined);
        }

        return exits.success(option.val);
    }
};
