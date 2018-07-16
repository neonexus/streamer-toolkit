module.exports = {
    primaryKey: 'id',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },

        userId: {
            type: 'string',
            required: true
        },

        name: {
            type: 'string',
            required: true
        },

        platform: {
            type: 'string',
            isIn: [
                'twitch',
                'discord',
                'mixer',
                'youtube'
            ],
            required: true
        },

        isMe: {
            type: 'boolean',
            defaultsTo: false
        },

        isMod: {
            type: 'boolean',
            defaultsTo: false
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
