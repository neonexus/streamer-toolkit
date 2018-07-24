let moment = require('moment-timezone');

module.exports = {
    friendlyName: 'Quote system',

    description: 'This allows viewers to add or recall quotes, and mods to remove them.',

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

        quote: {
            description: 'The command to run: add / remove or just a number to recall.',
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function(inputs, exits, env){
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            command = (inputs.quote.trim().indexOf(' ') === -1)
                ? inputs.quote.trim()
                : inputs.quote.trim().substr(0, inputs.quote.trim().indexOf(' ')),
            quoteString = (inputs.quote.trim().indexOf(' ') === -1)
                ? ''
                : inputs.quote.trim().substr(inputs.quote.trim().indexOf(' ') + 1),
            out = '',
            gameId = null,
            gameName = 'Off-stream chat',
            quote = null;

        if (command && command !== '') {
            switch (command.toLowerCase()) {
                case 'add':
                    if (!quoteString || quoteString === '') {
                        return await env.res.chatbotResponse('You have to actually type the quote out. I can\'t read your mind (yet).');
                    }

                    if (!sails.config.allowExplicit) {
                        let censoredQuote = await sails.helpers.makeExternalRequest.with({
                            requestId: env.req.requestId,
                            uri: 'https://www.purgomalum.com/service/plain?text=' + encodeURIComponent(quoteString) + '&fill_text=*BLEEP*&add=cock,dick',
                            json: false
                        });

                        if (censoredQuote.err) {
                            console.log(censoredQuote.err);
                        }

                        quoteString = censoredQuote.body;
                    }

                    let streamMeta = await sails.helpers.makeExternalRequest.with({
                        uri: sails.config.twitch.url + '/streams/metadata?user_login=' + sails.config.twitch.channel,
                        clientId: sails.config.twitch.clientId
                    });

                    if (streamMeta.err) {
                        console.log(streamMeta.err);
                    }

                    if (streamMeta.body.data[0] && streamMeta.body.data[0].game_id) {
                        let gameMeta = await sails.helpers.makeExternalRequest.with({
                            uri: sails.config.twitch.url + '/games?id=' + streamMeta.body.data[0].game_id,
                            clientId: sails.config.twitch.clientId
                        });

                        if (gameMeta.err) {
                            console.log(gameMeta.err);
                        }

                        if (gameMeta.body.data[0] && gameMeta.body.data[0].name) {
                            gameId = gameMeta.body.data[0].id;
                            gameName = gameMeta.body.data[0].name;
                        }
                    }

                    quote = await Quote.create({
                        viewer: viewer.id,
                        quote: quoteString,
                        gameId: gameId,
                        gameName: gameName
                    }).fetch();

                    out = 'Quote #' + quote.id + ' has been saved -> ' + quote.quote + ' [' + gameName + '] added by ' + await sails.helpers.getViewerMention(viewer);

                    break;
                case 'count':
                    let quoteCount = await Quote.count({});

                    out = await sails.helpers.getViewerMention(viewer) + ' there ';
                    out += (quoteCount === 1) ? 'is' : 'are';
                    out += ' currently ' + quoteCount + ' ';
                    out += (quoteCount === 1) ? 'quote saved.' : 'quotes saved.';

                    break;
                case 'remove':
                case 'delete':
                    if (isNaN(quoteString)) {
                        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' I have no clue what you are attempting.');
                    }

                    quote = await Quote.findOne(quoteString);

                    if (!quote || !quote.id) {
                        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' I\'m sorry, but there is no quote stored with that ID.');
                    }

                    if (!viewer.isMe && !viewer.isMod && quote.viewer !== viewer.id) {
                        return await env.res.chatbotResponse(
                            await sails.helpers.getViewerMention(viewer) + ' you are not a moderator, and can not remove other people\'s quotes. That\'s just not nice!'
                        );
                    }

                    await Quote.destroy(quoteString);

                    out = 'Quote #' + quote.id + ' has been stricken from the record, never to be read again.';

                    break;
                default:
                    if (isNaN(command)) {
                        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' I have no idea what you are trying to do.');
                    }

                    quote = await Quote.findOne({id: command});

                    if (!quote || !quote.id) {
                        return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' I\'m sorry, but there is no quote stored with that ID.');
                    }

                    out = 'Quote #' + quote.id + ' [' + quote.gameName + '] ' + moment(quote.createdAt).calendar() + ': \n\n'
                        + quote.quote + ' (added by ' + await sails.helpers.getViewerMention(quote.viewer, viewer.platform) + ')';

                    break;
            }
        } else {
            out = 'To recall a quote: !quote 7 (use !quotes to get the list) \n\n'
                + 'To add a quote: !quote add This is the quote text I want to save.';
        }

        return await env.res.chatbotResponse(out);
    }
};
