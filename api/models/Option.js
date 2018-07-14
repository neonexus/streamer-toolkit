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
            columnType: 'varchar(191) CHARACTER SET utf8mb4'
        },

        val: {
            type: 'json',
            required: true
        }
    }
};
