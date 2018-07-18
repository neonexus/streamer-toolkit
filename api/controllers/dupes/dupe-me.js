module.exports = {
    friendlyName: 'Dupe Me',

    description: '!dupeMe handler, it adds the viewers requested name to the duplicant name pool.',

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

        options: {
            description: 'The part after !dupeMe, so in case of "!dupeMe Neo I want to be Meep please!", this would be "Neo I want to be Meep please!".',
            type: 'string',
            required: false
        }
    },

    exits: {
        success: {},
        ok: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            name = inputs.options.substr(0, inputs.options.indexOf(' ')),
            note = inputs.options.substr(inputs.options.indexOf(' ') + 1),
            isOpen = await sails.helpers.getOption('dupes');

        if (!inputs.options) {
            return await env.res.chatbotResponse('This command is used to add your name to the duplicant name pool. '
                + 'First, type the command, a space, the name you want for your duplicant (proper casing, no spaces), then your duplicant preference (optional).'
                + '\nExample: $(discord **)!dupeMe NeoNexusDeMortis I want to be Meep please!$(discord **)'
                + '\nGet the current count: $(discord **)!dupeMe count$(discord **)');
        }

        if (!isOpen) {
            return await env.res.chatbotResponse('Sorry ' + await sails.helpers.getViewerMention(viewer) + ', but the duplicant pool is closed at the moment.');
        }

        if (!name && note) {
            name = note;
            note = '';
        }

        let dupes = await Dupe.count({});

        if (inputs.options.toLowerCase() === 'count') {
            if (!dupes) {
                return await env.res.chatbotResponse('There are currently no names in the pool!');
            }

            return await env.res.chatbotResponse('There are currently ' + dupes + ' duplicant names in the pool.');
        }

        async function createDupe(){
            Dupe.create({name: name, note: note, viewer: viewer.id}, function(err){
                if (err) {
                    console.log(err);
                }
            });

            let say = 'Thanks ' + await sails.helpers.getViewerMention(viewer) + ', ';

            say += 'your duplicant name "' + name +'"';

            if (note) {
                say += ' (' + note + ') ';
            }

            say += ' has been added to the list! You are number ' + (dupes + 1) + ' in line.';

            return await env.res.chatbotResponse(say);
        }

        Dupe.findOne({viewer: viewer.id}, async function(err, dupe){
            if (err) {
                console.log(err);
            }

            if (dupe) {
                let say = 'Sorry ' + await sails.helpers.getViewerMention(viewer) + ', '
                    + 'but you already have a name in the pool: "' + dupe.name + '". You can remove it from the pool with !undupeMe';

                return await env.res.chatbotResponse(say);
            }

            return createDupe();
        });
    }
};
