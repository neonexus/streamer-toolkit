module.exports = {
    primaryKey: 'id',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },

        viewer: {
            model: 'viewer'
        },

        parent: {
            model: 'requestlog'
        },

        direction: {
            type: 'string',
            isIn: [
                'inbound',
                'outbound'
            ],
            required: true,
            columnType: 'varchar(8)'
        },

        method: {
            type: 'string',
            isIn: [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'PATCH'
            ],
            required: true,
            columnType: 'varchar(6)'
        },

        path: {
            type: 'string',
            required: true,
            columnType: 'varchar(191)'
        },

        headers: {
            type: 'string',
            columnType: 'longtext',
            allowNull: true
        },

        getParams: {
            type: 'string',
            columnType: 'longtext',
            allowNull: true
        },

        body: {
            type: 'string',
            columnType: 'longtext',
            allowNull: true
        },

        responseCode: {
            type: 'number',
            allowNull: true,
            columnType: 'int(4) unsigned'
        },

        responseBody: {
            type: 'string',
            columnType: 'longtext',
            allowNull: true
        },

        responseHeaders: {
            type: 'string',
            columnType: 'longtext',
            allowNull: true
        },

        responseTime: {
            type: 'string',
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
