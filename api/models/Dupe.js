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
            required: true,
            columnType: 'varchar(191)'
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
