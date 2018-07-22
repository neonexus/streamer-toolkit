module.exports = {
    friendlyName: 'Magic 8 Ball',

    description: 'Ask the magic 8 ball a question, get an answer?',

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

    fn: async function(inputs, exits, env){
        let choices = [
                'All signs point to yes!',
                'Yes!',
                'My sources say nope.',
                'You may rely on it.',
                'Now isn\'t a good time...',
                'Outlook not so good.',
                'It is decidedly so!',
                'Better not tell you.',
                'Very doubtful.',
                'Yes - Definitely!',
                'It is certain!',
                'Most likely.',
                'Ask again later.',
                'No.',
                'Outlook good.',
                'Don\'t count on it.',
                'You just rolled a \'nat 20! (that means yes + 1!)'
            ],
            die = await sails.helpers.rollDice(1, choices.length)[0],
            viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}); // used here to make admin account creation easier

        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' ' +choices[die - 1]);
    }
};
