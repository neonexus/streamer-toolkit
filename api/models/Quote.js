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

        gameId: {
            type: 'number',
            allowNull: true
        },

        gameName: {
            type: 'string',
            required: true
        },

        quote: {
            type: 'string',
            required: true,
            columnType: 'text'
        },

        createdAt: {
            type: 'string',
            columnType: 'datetime',
            autoCreatedAt: true
        }
    }
};
