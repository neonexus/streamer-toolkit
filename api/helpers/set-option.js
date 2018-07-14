module.exports = {
    friendlyName: 'Set Option',

    description: '',

    inputs: {
        name: {
            type: 'string',
            required: true
        },

        val: {
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
