module.exports = {
    friendlyName: 'Next Dupe',

    description: 'Get the next duplicant name from the queue, remove them from queue and announce.',

    inputs: {
        user: {
            description: 'The plain username of the viewer running the command.',
            type: 'string',
            required: true
        },

        userId: {
            description: 'The platform-dependent user ID of the viewer running the command.',
            type: 'string',
            required: true
        },

        platform: {
            description: 'The platform that the command was issued from.',
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
            user = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform});

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
