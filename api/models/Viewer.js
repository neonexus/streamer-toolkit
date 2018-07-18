module.exports = {
    primaryKey: 'id',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },

        userId: {
            type: 'string',
            required: true,
            columnType: 'varchar(191)'
        },

        name: {
            type: 'string',
            required: true,
            columnType: 'varchar(191)'
        },

        platform: {
            type: 'string',
            isIn: [
                'twitch',
                'discord',
                'mixer',
                'youtube'
            ],
            required: true,
            columnType: 'varchar(7)'
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
            allowNull: true,
            columnType: 'varchar(191)'
        },

        createdAt: {
            type: 'string',
            columnType: 'datetime',
            autoCreatedAt: true
        }
    }
};
