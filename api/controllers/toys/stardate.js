let moment = require('moment-timezone');

module.exports = {
    friendlyName: 'Star Date Calculator',

    description: 'Will calculate star dates back \'n forth, to and from, current calendar dates, in OG, TNG, and "TODAY" versions.',

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

        stardate: {
            description: 'Should start with the version, then the date, "today" is default: "tng July 24, 2018 05:47 CDT" would produce: "-275420.79"',
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function(inputs, exits, env){
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            version = inputs.stardate.trim().substr(0, inputs.stardate.trim().indexOf(' ')), // will be empty in case of `!starDate 46154.4`
            stardateInput = inputs.stardate.trim().substr(inputs.stardate.trim().indexOf(' ') + 1), // will be default variable in case of `!starDate 46154.4` or `!stardate today`
            stardateOrigin = moment('1987-07-05 12:00:00').tz('UTC'),
            stardateProper = null,
            out = '',
            dateFormats = [
                'YYYY-MM-DD',
                'YYYY-MM-DD HH:mm',
                'YYYY-MM-DDTHH:mm',
                'YYYY-MM-DD HH:mm:ss',
                'YYYY-MM-DDTHH:mm:ss',
                'YYYY-MM-DD HH:mm:ssZ',
                'YYYY-MM-DDTHH:mm:ssZ',
                'YYYY-MM-DD HH:mm:ss Z',
                'YYYY-MM-DDTHH:mm:ss Z'
            ];

        if (!version || version === '') {
            version = 'today';
        } else {
            version = version.toLowerCase();
        }

        if (isNaN(stardateInput) && stardateInput !== 'today' && !moment(stardateInput, dateFormats, true).isValid()) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' that appears to be an incorrect date format (YYYY-MM-DD).');
        }

        switch (version) {
            case 'today':
                let stardateDifferential = (1000 * 60 * 60 * 24 * 0.036525);

                if (stardateInput === 'today') {
                    stardateInput = moment(new Date()).tz('UTC').format();
                }

                if (!isNaN(stardateInput)) { // trying to convert a stardate back into a date
                    stardateProper = parseFloat(stardateInput) * 10;
                    stardateProper = Math.ceil(stardateProper - 410000);
                    stardateProper = stardateProper * stardateDifferential;
                    stardateProper = stardateProper + stardateOrigin.valueOf();
                    stardateProper = moment(new Date(stardateProper)).tz('UTC');

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate ' + stardateInput + ' is ' + stardateProper.format('dddd, MMMM Do YYYY') + '.';
                } else {
                    // Original script was created by Phillip L. Sublett (Phillip.L@Sublett.org)
                    // http://TrekGuide.com/Stardates.htm

                    stardateInput = moment(stardateInput, dateFormats, true).tz('UTC');

                    stardateProper = stardateInput.valueOf() - stardateOrigin.valueOf(); // valueOf() is Unix milliseconds
                    stardateProper = stardateProper / stardateDifferential;
                    stardateProper = Math.floor(stardateProper + 410000);
                    stardateProper = stardateProper / 10;

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate for ' + stardateInput.format('dddd, MMMM Do, YYYY') + ' would be ' + stardateProper;
                }

                break;
            case 'tng':
            case 'ds9':
                // Original script by Phillip L. Sublett (TrekMaster@TrekGuide.com)
                // http://TrekGuide.com/Stardates.htm
                // An average Earth year comprises 365.2422 mean solar days
                // Voyager episode "Homestead" stated Stardate 54868.6 was on April 6, 2378
                // 918.23186 Stardates = 1 year
                // 0.00108904956 year = 1.0 Stardate
                // 0.397766856 day = 1.0 Stardate
                // 34,367.0564 seconds = 1.0 Stardate
                // 34367056.4 milliseconds = 1.0 Stardate
                // Stardate 00000.0 started on Friday, July 5, 2318, around noon

                stardateOrigin.add(331, 'years'); // July 5, 2318

                if (stardateInput === 'today') {
                    stardateInput = moment(new Date()).tz('UTC').format();
                }

                if (!isNaN(stardateInput)) { // trying to convert a stardate back into a date
                    stardateProper = stardateInput * 34367056.4;
                    stardateProper = stardateProper + stardateOrigin.valueOf();
                    stardateProper = moment(new Date(stardateProper)).tz('UTC');

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate ' + stardateInput + ' in the TNG universe is ' + stardateProper.format('dddd, MMMM Do YYYY') + '.';
                } else {
                    stardateInput = moment(stardateInput, dateFormats, true).tz('UTC');

                    stardateProper = stardateInput.valueOf() - stardateOrigin.valueOf();
                    stardateProper = stardateProper / 34367056.4;
                    stardateProper = Math.floor(stardateProper * 100);
                    stardateProper = stardateProper / 100;
                    stardateProper = stardateProper.toFixed(1);

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate for ' + stardateInput.format('dddd, MMMM Do, YYYY') + ' in the TNG universe would be ' + stardateProper;
                }

                break;
            case 'og':
            case 'original':
            case 'tos':
                // Original script by Phillip L. Sublett
                // TrekMaster@TrekGuide.com
                // http://TrekGuide.com
                // http://TrekGuide.com/Stardates.htm
                // An average Earth year comprises 365.2422 mean solar days
                // TOS Stardate 0000.0 began on Tuesday, April 25, 2265, at 00:00 hours.
                // The lowest possible TOS Stardate-to-year ratio is 2635.10833 Stardates per year
                // at least 7.21468749 Stardates per day
                // 1 Stardate is less than 0.138606142 day
                // 1 Stardate is less than 11,975,570.7 milliseconds

                stardateOrigin = moment('2265-04-25 00:00:00').tz('UTC');

                if (stardateInput === 'today') {
                    stardateInput = moment(new Date()).tz('UTC').format();
                }

                if (!isNaN(stardateInput)) { // trying to convert a stardate back into a date
                    stardateProper = (stardateInput * 60 * 60 * 24 * 365.2422) / 2.63510833;
                    stardateProper = stardateProper + stardateOrigin.valueOf();
                    stardateProper = moment(new Date(stardateProper)).tz('UTC');

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate ' + stardateInput + ' in TOS universe is ' + stardateProper.format('dddd, MMMM Do YYYY') + '.';
                } else {
                    stardateInput = moment(stardateInput, dateFormats, true).tz('UTC');

                    stardateProper = stardateInput.valueOf() - stardateOrigin.valueOf();
                    stardateProper = stardateProper / (60 * 60 * 24 * 365.2422);
                    stardateProper = stardateProper * 2.63510833;
                    stardateProper = Math.floor(stardateProper * 1000);
                    stardateProper = Math.floor(stardateProper / 10);
                    stardateProper = stardateProper / 100;

                    out = await sails.helpers.getViewerMention(viewer) + ' the stardate for ' + stardateInput.format('dddd, MMMM Do, YYYY') + ' in TOS universe would be ' + stardateProper;
                }

                break;
            default:
                out = await sails.helpers.getViewerMention(viewer) + ' that is not a recognized stardate version. Only "today", "tng/ds9" or "og/original/tos" are options.';
                break;
        }

        return await env.res.chatbotResponse(out);
    }
};
