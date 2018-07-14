module.exports = {
    friendlyName: 'Get viewer',

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

        req: {
            type: 'ref',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits) {
        let viewer = await Viewer.findOne({userId: inputs.userId, type: inputs.type});

        if (!viewer) {
            viewer = await Viewer.create({userId: inputs.userId, name: inputs.user, type: inputs.type}).fetch();
        } else if (viewer && viewer.name !== inputs.user) {
            let temp = await Viewer.update({userId: inputs.userId, type: inputs.type}, {name: inputs.user}).fetch();
            viewer = temp[0];
        }

        inputs.req.viewer = viewer;

        return exits.success(viewer);
    }
};
