module.exports = {
    sync: true,

    friendlyName: 'Role Dice',

    description: '',

    inputs: {
        dice: { // the total number of dice to roll
            type: 'number',
            defaultsTo: 1
        },

        max: {
            type: 'number',
            defaultsTo: 6
        }
    },

    exits: {
        success: {}
    },

    fn: function (inputs, exits) {
        let finalRolls = [];

        for (let i = 0; i < inputs.dice; ++i) {
            let roll = Math.floor(Math.random() * inputs.max) + 1; // add 1 to shift from zero-based randomness

            finalRolls.push(roll);
        }

        return exits.success(finalRolls);
    }
};
