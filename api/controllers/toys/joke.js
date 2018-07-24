module.exports = {
    friendlyName: 'Chuck Norris jokes',

    description: 'Pull a random joke from ChuckNorris.io for all to see.',

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

        category: {
            description: 'The category to get a joke for. Categories can be retrieved with "!joke categories"',
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let uri = 'https://api.chucknorris.io/jokes/random?category=',
            viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}), // just to make setting up admins easier
            cats = 'dev, movie, food, celebrity, science, sport, animal, history, music, travel, career, money, fashion';

        if (sails.config.allowExplicit) {
            cats += ', explicit, religious, political';
        }

        if (inputs.category) {
            if (inputs.category.toLowerCase().trim() === 'categories') {
                return await env.res.chatbotResponse('The available joke categories are: ' + cats);
            }

            if (
                !sails.config.allowExplicit &&
                (inputs.category.toLowerCase().trim() === 'explicit' || inputs.category.toLowerCase().trim() === 'religion' || inputs.category.toLowerCase().trim() === 'political')
            ) {
                return await env.res.chatbotResponse('Sorry, but no. Just no.');
            }

            uri += inputs.category;
        } else {
            cats = cats.split(', ');

            uri += cats[Math.floor(Math.random() * cats.length)];
        }

        let joke = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri});

        if (joke.err) {
            console.log(joke.err);
        }

        // should probably re-code this to validate against the hard-coded cats in this file
        if (joke.body.code && joke.body.code === 404) {
            return await env.res.chatbotResponse('That doesn\'t look like a valid category... Use "!joke categories" to get a list of valid ones.');
        }

        let finalJoke = joke.body.value;

        if (!sails.config.allowExplicit) {
            let censoredJoke = await sails.helpers.makeExternalRequest.with({
                requestId: env.req.requestId,
                uri: 'https://www.purgomalum.com/service/plain?text=' + finalJoke + '&fill_text=*BLEEP*&add=cock,dick',
                json: false
            });

            if (censoredJoke.err) {
                console.log(censoredJoke.err);
            }

            finalJoke = censoredJoke.body;
        }

        return await env.res.chatbotResponse('[' + joke.body.category + '] ' + finalJoke);
    }
};
