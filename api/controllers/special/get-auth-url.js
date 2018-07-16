module.exports = {
    friendlyName: 'Get auth URL',

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

        platform: {
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/authorize?client_id=' + sails.config.streamLabs.clientId + '&redirect_uri=' + encodeURIComponent(sails.config.streamLabs.redirectUri)
                + '&response_type=code&scope=donations.read+donations.create+jar.write+alerts.create+points.read+points.write+alerts.write+credits.write+profiles.write+wheel.write';

        if (!viewer.isMe) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' sorry, but this is an admin only command.');
        }

        return await env.res.chatbotResponse('$[whisper] MAKE ABSOLUTELY SURE YOU ARE NOT STREAMING! THIS IS A SENSITIVE FEATURE! ' + uri);
    }
};
