module.exports = {
    friendlyName: 'Dice game',

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
        },

        bet: {
            type: 'string' // so we can use a custom error message if it's not a number
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + inputs.user,
            win = 0,
            bet = 0;

        if (viewer.type !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        if (inputs.bet !== 'rules' && isNaN(inputs.bet)) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' That is not a number. MrDestructoid SwiftRage');
        }

        if (inputs.bet === 'rules') {
            return await env.res.chatbotResponse('The rules are simple: you place your bet with "!dice BET", where BET is the number of tokens (!tokens) you are willing to wager, then the bot '
                + 'will role the dice (2d6). 10 or 11 is break even. 12 is worth 2x. 7 is worth 3x. Snake eyes (2) is lose double. GOOD LUCK!');
        }

        if (inputs.bet) {
            bet = inputs.bet;
        } else {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' You must specify a wager (ex: !dice 5). If you want to know the rules, use !dice rules');
        }

        let tokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (tokens.err) {
            console.log(tokens.err);
        }

        let points = tokens.body.points;

        if (bet > points) {
            return await env.res.chatbotResponse('You only have ' + points + ' tokens left. You don\'t have enough for this bet :(');
        }

        let rolls = sails.helpers.rollDice(2, 6),
            firstDie = rolls[0],
            secondDie = rolls[1],
            total = firstDie + secondDie,
            message = '';

        switch (total) {
            case 2:
                win = bet * -2;
                message = 'lost everything and then some! You just got bit by the snake, and lost ' + win + ' tokens. OUCH! RuleFive WutFace';
                break;
            case 7:
                win = 3 * bet;
                message = 'HIT THE JACKPOT! You just won ' + win + ' tokens! :O Kappa Kreygasm TheIlluminati';
                break;
            case 10:
            case 11:
                win = 0;
                message = 'broke even. Better than losing, right? WTRuck';
                break;
            case 12:
                win = 2 * bet;
                message = 'lucky duck! You just won ' + win + ' tokens! BloodTrail KevinTurtle';
                break;
            default:
                win = -1 * bet;
                message = 'lose! Womp womp CrreamAwk NotLikeThis'
        }

        points = points + win;

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + inputs.user;

        await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: points}});

        return await env.res.chatbotResponse(
            await sails.helpers.getMentionName(viewer) + ' (' + points + ') you bet: ' + bet + ' and you rolled: ' + firstDie + ' + ' + secondDie + ' = ' + total + '. You ' + message
        );
    }
};
