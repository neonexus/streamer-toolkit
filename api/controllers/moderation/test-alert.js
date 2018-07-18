module.exports = {
    friendlyName: 'Test StreamLabs Alerts',

    description: 'Tell StreamLabs to fire a test alert. Use !testAlert types to get the list of options.',

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

        alertType: {
            description: 'The chosen alert type that StreamLabs should fire.',
            type: 'string',
            required: false, // so we can handle empty string
            isIn: [
                'bits', // twitch only
                'donation', // yt or twitch
                'follow', // twitch only
                'host', // twitch only
                'raid', // twitch only
                'sponsor', // yt only
                'subscription', // yt or twitch
                'superchat', // yt only
                'types' // special
            ]
        },

        alertPlatform: {
            description: 'In some cases, we need to know the context of the alert. Like "subscription", is it for Twitch or YouTube?',
            type: 'string',
            required: false,
            isIn: [
                'twitch',
                'youtube'
            ],
            defaultsTo: 'twitch'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/alerts/send_test_alert';

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' sorry, but this is a moderator only command.');
        }

        if (!inputs.alertType) {
            return await env.res.chatbotResponse(
                await sails.helpers.getViewerMention(viewer) + ' To use this command, you must specify an alert type. Use "!testAlert types" to get the list of possible choices.'
            );
        }

        if (inputs.alertType === 'types') {
            return await env.res.chatbotResponse(
                await sails.helpers.getViewerMention(viewer) + ' Possible alert types for Twitch: bits, donation, follow, host, raid, subscription. '
                + 'Possible alert types for YouTube: donation, sponsor, subscription, superchat. Use like so: "!testAlert subscription youtube"'
            );
        }

        let response = await sails.helpers.makeExternalRequest.with({
            requestId: env.req.requestId,
            uri: uri,
            bearer: sails.config.streamLabs.token,
            body: {
                type: inputs.alertType,
                platform: inputs.alertPlatform
            },
            method: 'POST'
        });

        if (response.body.error) {
            return await env.res.chatbotResponse('Not sure what happened, but something went wrong. Check the request logs.');
        }

        return await env.res.chatbotResponse('An alert should go off any second now.');
    }
};
