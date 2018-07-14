module.exports = {
    friendlyName: 'Get Option',

    description: '',

    inputs: {
        name: {
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
