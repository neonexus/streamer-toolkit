module.exports = {
    sync: true,

    friendlyName: 'Role Dice',

    description: 'A simple tool to "roll dice". Takes in dice count and their max number, assuming 1 is lowest (2d6), and returns an array of the results.',

    inputs: {
        dice: {
            description: 'Total number of dice to roll',
            type: 'number',
            defaultsTo: 1
        },

        max: {
            description: 'The max number of the dice. If rolling 2d6, dice would be 2, max would be 6.',
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
