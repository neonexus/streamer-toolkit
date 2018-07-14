module.exports = {
    friendlyName: 'Next Dupe',

    description: '',

    inputs: {
        user: {
            description: '',
            type: 'string',
            required: true
        },

        userId: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let dupesFound = await Dupe.find({}).populate('viewer').sort('id ASC'),
            dupe = dupesFound[0],
            user = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, type: inputs.type});

        if (!user.isMe && !user.isMod) {
            return await env.res.chatbotResponse('You are not a moderator, and are not allowed to use this command.');
        }

        if (!dupe || !dupe.name) {
            return await env.res.chatbotResponse('There are no dupe names in the pool :(');
        }

        Dupe.destroy({id: dupe.id}, function(err){
            if (err) {
                console.log(err);
            }
        });

        let out = 'And, our next duplicant is: ';

        if (dupe.name !== dupe.viewer.name) {
            out += dupe.name + ' (@' + dupe.viewer.name + ')! ';
        } else {
            out += '@' + dupe.viewer.name + '! ';
        }

        if (dupe.note) {
            out += ' Note: ' + dupe.note;
        }

        out += 'Welcome to the colony; I make no guarantees of your survival, but I will do my best to keep your dupe alive.';

        return await env.res.chatbotResponse(out);
    }
};
