module.exports = {
    friendlyName: 'Dice game',

    description: 'A simple gambling game that uses the viewer\'s loyalty points.',

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

        bet: {
            description: 'Should be a number from "!bet 10" or the like.',
            type: 'string', // so we can use a custom error message if it's not a number
            required: false // we have a custom error message in the controller
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

        if (viewer.platform !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        if (inputs.bet !== 'rules' && isNaN(inputs.bet)) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' That is not a number. MrDestructoid SwiftRage');
        }

        if (inputs.bet === 'rules') {
            return await env.res.chatbotResponse('The rules are simple: you place your bet with "!dice BET", where BET is the number of ' + sails.config.streamLabs.loyaltyPointsLabel
                + ' (' + sails.config.streamLabs.loyaltyPointsCommand + ') you are willing to wager, then the bot will role the dice (2d6). 10 or 11 is break even. 12 is worth 2x. 7 is worth 3x. '
                + 'Snake eyes (2) is lose double. GOOD LUCK!');
        }

        if (inputs.bet) {
            bet = inputs.bet;
        } else {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' You must specify a wager (ex: !dice 5). If you want to know the rules, use !dice rules');
        }

        let points = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (points.err) {
            console.log(points.err);
        }

        points = points.body.points;

        if (bet > points) {
            return await env.res.chatbotResponse('You only have ' + points + ' ' + sails.config.streamLabs.loyaltyPointsLabel + ' left. You don\'t have enough for this bet :(');
        }

        let rolls = sails.helpers.rollDice(2, 6),
            firstDie = rolls[0],
            secondDie = rolls[1],
            total = firstDie + secondDie,
            message = '';

        switch (total) {
            case 2:
                win = bet * -2; // loss
                message = 'lost everything and then some! You just got bit by the snake, and lost ' + win + ' ' + sails.config.streamLabs.loyaltyPointsLabel + '. OUCH! RuleFive WutFace';
                break;
            case 7:
                win = 3 * bet;
                message = 'HIT THE JACKPOT! You just won ' + win + ' ' + sails.config.streamLabs.loyaltyPointsLabel + '! :O Kappa Kreygasm TheIlluminati';
                break;
            case 10:
            case 11:
                win = 0;
                message = 'broke even. Better than losing, right? WTRuck';
                break;
            case 12:
                win = 2 * bet;
                message = 'lucky duck! You just won ' + win + ' ' + sails.config.streamLabs.loyaltyPointsLabel + '! BloodTrail KevinTurtle';
                break;
            default:
                win = -1 * bet; // loss
                message = 'lose! Womp womp CrreamAwk NotLikeThis'
        }

        points = points + win;

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + inputs.user;

        await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: points}});

        return await env.res.chatbotResponse(
            await sails.helpers.getViewerMention(viewer) + ' (' + points + ') you bet: ' + bet + ' and you rolled: ' + firstDie + ' + ' + secondDie + ' = ' + total + '. You ' + message
        );
    }
};
