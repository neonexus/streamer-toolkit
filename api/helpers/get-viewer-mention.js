module.exports = {

    friendlyName: 'Get mention name',

    description: 'Get the @mention for the viewer.',

    inputs: {
        viewer: {
            description: 'A "viewer" model record.',
            type: 'ref',
            required: true
        },

        matchPlatform: {
            description: 'The platform to cater to (useful for displaying Discord handles on Twitch).',
            type: 'string',
            allowNull: true
        }
    },

    exits: {},

    fn: async function(inputs, exits){
        let viewer = inputs.viewer;

        if (!isNaN(viewer)) {
            viewer = await Viewer.findOne(viewer);
        }

        if (!inputs.viewer.name && inputs.viewer.id) {
            viewer = await Viewer.findOne(inputs.viewer.id);
        }

        if (inputs.matchPlatform && inputs.matchPlatform !== '' && inputs.matchPlatform !== viewer.platform) {
            let platform = (viewer.platform !== 'youtube') ? _.capitalize(viewer.platform) : 'YouTube';

            return exits.success('@' + viewer.name + ' [' + platform + ']');
        } else if (viewer.platform === 'discord') {
            return exits.success('<@' + viewer.userId + '>');
        } else {
            return exits.success('@' + viewer.name);
        }
    }
};

