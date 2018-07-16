module.exports = {
    friendlyName: 'Start dupes',

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

    exits: {},

    fn: async function(inputs, exits, env){
        let user = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform});

        if (!user.isMe && !user.isMod) {
            return await env.res.chatbotResponse('You are not a moderator, and are not allowed to use this command.');
        }

        await sails.helpers.setOption('dupes', true);

        return env.res.chatbotResponse('Hey everyone, the duplicant pool is now open! Use this chat command to join: !dupeme MyDuplicantName');
    }
};
