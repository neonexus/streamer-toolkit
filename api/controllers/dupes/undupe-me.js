module.exports = {
    friendlyName: 'Un-dupe Me',

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

        confirmed: {
            type: 'string',
            required: false
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
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, type: inputs.type}),
            dupe = await Dupe.findOne({viewer: viewer.id});

        if (!dupe) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' you don\'t currently have a dupe name in the pool.');
        }

        if (!inputs.confirmed) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ', this command will remove the dupe name "' + dupe.name + '" from the pool. If you are absolutely sure about this, type: !undupeMe yes');
        }

        if (inputs.confirmed.toLowerCase() === 'yes') {
            Dupe.destroy({viewer: viewer.id}, function(err){
                if (err) {
                    console.log(err);
                }
            });

            return await env.res.chatbotResponse('OK, your dupe has been removed from the pool ' + await sails.helpers.getMentionName(viewer) + '.');
        }

        return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' I\'m sorry, I don\'t understand what you are trying to do.');
    }
};
