const message = (sequelize, DataTypes) => {
    const Message = sequelize.define('message',{
        text: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    args:true,
                    msg: 'A message has to have text',
                },
            },
        }
    });

    Message.associate = models => {
        Message.belongsTo(models.User);
    };

    return Message;
};

export { message };

