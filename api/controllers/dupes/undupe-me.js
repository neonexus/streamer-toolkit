module.exports = {
    friendlyName: 'Un-dupe Me',

    description: 'Remove the viewer\'s duplicant name from the pool.',

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
        },

        confirmed: {
            description: 'Should be "yes" from "!undupeMe yes".',
            type: 'string',
            required: false
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            dupe = await Dupe.findOne({viewer: viewer.id});

        if (!dupe) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' you don\'t currently have a dupe name in the pool.');
        }

        if (!inputs.confirmed) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ', this command will remove the dupe name "' + dupe.name + '" from the pool. If you are absolutely sure about this, type: !undupeMe yes');
        }

        if (inputs.confirmed.toLowerCase() === 'yes') {
            Dupe.destroy({viewer: viewer.id}, function(err){
                if (err) {
                    console.log(err);
                }
            });

            return await env.res.chatbotResponse('OK, your dupe has been removed from the pool ' + await sails.helpers.getViewerMention(viewer) + '.');
        }

        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' I\'m sorry, I don\'t understand what you are trying to do.');
    }
};
