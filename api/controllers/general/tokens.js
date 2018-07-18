let moment = require('moment-timezone');

module.exports = {
    friendlyName: 'Tokens',

    description: 'Get the current viewer\'s current token count.',

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
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + inputs.user,
            streamer = await Viewer.findOne({isMe: true, platform: 'twitch'});

        if (viewer.platform !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        let tokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (tokens.err) {
            console.log(tokens.err);
        }

        let twitchFollowerMessage = '';

        if (streamer && streamer.id !== viewer.id) {
            uri = sails.config.twitch.url + '/users/follows?to_id=' + streamer.userId + '&from_id=' + viewer.userId;

            let followingTime = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, clientId: sails.config.twitch.clientId});

            if (followingTime.err) {
                console.log(followingTime.err);
            }

            if (followingTime.body.data && followingTime.body.data[0] && followingTime.body.data[0].followed_at) {
                twitchFollowerMessage += 'You\'ve been a follower for ' + moment(followingTime.body.data[0].followed_at).fromNow(true) + '. Thank you so much for your support!'
            } else {
                twitchFollowerMessage += 'It appears you are not yet a follower :('
            }
        }

        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' you have ' + tokens.body.points + ' tokens available. ' + twitchFollowerMessage);
    }
};
