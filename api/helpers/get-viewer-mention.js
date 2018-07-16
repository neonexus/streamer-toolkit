module.exports = {

    friendlyName: 'Get mention name',

    description: '',

    inputs: {
        viewer: {
            type: 'ref',
            required: true
        }
    },

    exits: {},

    fn: async function(inputs, exits){
        let viewer = inputs.viewer;

        if (!inputs.viewer.name && inputs.viewer.id) {
            viewer = await Viewer.findOne(inputs.viewer.id);
        }

        if (viewer.type === 'discord') {
            return exits.success('<@' + viewer.userId + '>');
        } else {
            return exits.success('@' + viewer.name);
        }
    }

};

