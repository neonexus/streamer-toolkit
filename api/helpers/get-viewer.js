module.exports = {
    friendlyName: 'Get viewer',

    description: '',

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

        req: {
            description: 'The "req" object, so we can keep track of the viewer through the entire request (for logging)',
            type: 'ref',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits) {
        let viewer = await Viewer.findOne({userId: inputs.userId, platform: inputs.platform});

        if (!viewer) {
            viewer = await Viewer.create({userId: inputs.userId, name: inputs.user, platform: inputs.platform}).fetch();
        } else if (viewer && viewer.name !== inputs.user) {
            let temp = await Viewer.update({userId: inputs.userId, platform: inputs.platform}, {name: inputs.user}).fetch();
            viewer = temp[0];
        }

        inputs.req.viewer = viewer;

        return exits.success(viewer);
    }
};
