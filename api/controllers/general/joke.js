module.exports = {
    friendlyName: 'Chuck Norris jokes',

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
        },

        category: {
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let uri = 'https://api.chucknorris.io/jokes/random?category=',
            cats = 'dev, movie, food, celebrity, science, sport, animal, history, music, travel, career, money, fashion';

        if (inputs.category) {
            if (inputs.category.toLowerCase().trim() === 'categories') {
                return await env.res.chatbotResponse('The available joke categories are: ' + cats);
            }

            if (inputs.category.toLowerCase().trim() === 'explicit' || inputs.category.toLowerCase().trim() === 'religion' || inputs.category.toLowerCase().trim() === 'political') {
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

        if (joke.body.code && joke.body.code === 404) {
            return await env.res.chatbotResponse('That doesn\'t look like a valid category... Use "!joke categories" to get a list of valid ones.');
        }

        let censoredJoke = await sails.helpers.makeExternalRequest.with({
            requestId: env.req.requestId,
            uri: 'https://www.purgomalum.com/service/plain?text=' + joke.body.value + '&fill_text=*BLEEP*&add=cock,dick',
            json: false
        });

        if (censoredJoke.err) {
            console.log(censoredJoke.err);
        }

        return await env.res.chatbotResponse('[' + joke.body.category + '] ' + censoredJoke.body);
    }
};
