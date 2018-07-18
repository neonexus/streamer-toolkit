module.exports = {
    primaryKey: 'id',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },

        name: {
            type: 'string',
            unique: true,
            columnType: 'varchar(191)'
        },

        val: {
            type: 'json',
            required: true
        }
    }
};
