import {Sequelize, DataTypes } from 'sequelize';
import { user } from './user.js';
import { message } from './message.js';

const sequelize = new Sequelize(
    process.env.TEST_DATABASE || process.env.DATABASE,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        dialect: 'postgres',
    },
);

const models = {
    User: user(sequelize,DataTypes),
    Message: message(sequelize,DataTypes),
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
      models[key].associate(models);
    }
});

export { sequelize };

export { models };