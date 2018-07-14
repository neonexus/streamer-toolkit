module.exports = {
    primaryKey: 'id',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },

        viewer: {
            model: 'viewer',
            required: true
        },

        name: {
            type: 'string',
            required: true
        },

        note: {
            type: 'string',
            required: false,
            allowNull: true
        },

        createdAt: {
            type: 'string',
            columnType: 'datetime',
            autoCreatedAt: true
        }
    }
};
