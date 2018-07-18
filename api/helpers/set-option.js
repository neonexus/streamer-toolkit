module.exports = {
    friendlyName: 'Set Option',

    description: 'Store an arbitrary option in the database.',

    inputs: {
        name: {
            description: 'The handle to use for retrieval.',
            type: 'string',
            required: true
        },

        val: {
            description: 'The JSON-ifiable value.',
            type: 'ref',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits) {
        let option = await Option.findOne({name: inputs.name});

        if (!option) {
            await Option.create({name: inputs.name, val: inputs.val});
        } else {
            await Option.update({name: inputs.name}, {val: inputs.val});
        }

        return exits.success();
    }
};
