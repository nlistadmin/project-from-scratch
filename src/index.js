import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import chalk from 'chalk';

// Getting error if index.js is not explicitly specified.  
// This requirement must have been changed somewhere along the line.
import schema from './schema/index.js';
import resolvers from './resolvers/index.js';
import { models, sequelize } from './models/index.js';

const getMe = async req => {
    const token = req.headers['x-token'];

    if (token) {
        try {
            return await jwt.verify(token,process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session expired.  Sign in again.',
            );
        }
    }
}


const eraseDatabaseOnSync = true;
const app = express();

app.use(cors());

const createUsersWithMessages = async (date) => {
    await models.User.create(
        {
            username: 'rwieruch',
            email: 'hello@robin.com',
            password:'rwieruch',
            role:'ADMIN',
            messages: [
                {
                    text: 'Published the Road to learn React',
                    createdAt: date.setSeconds(date.getSeconds()+1),
                }
            ],
        },
        {
            include: [models.Message],
        }
    );
    await models.User.create(
        {
            username: 'ddavids',
            email: 'hello@david.com',
            password: 'ddavids',
            role: '',
            messages: [
                {
                    text: 'Happy to release ...',
                    createdAt: date.setSeconds(date.getSeconds()+1),
                },
                {
                    text: 'Published a complete ...',
                    createdAt: date.setSeconds(date.getSeconds()+1),
                }
            ],
        },
        {
            include: [models.Message],
        }
    );
    await models.User.create(
        {
            username: 'lmaritz',
            email: 'lmaritz@gmail.com',
            password:'password',
            role:'',
            messages: [
                {
                    text: 'Educational techniques report issued',
                    createdAt: date.setSeconds(date.getSeconds()+1),
                }
            ],
        },
        {
            include: [models.Message],
        }
    );
    await models.User.create(
        {
            username: 'aprinsloo',
            email: 'aprinsloo@yahoo.com',
            password:'password',
            role:'',
            messages: [
                {
                    text: 'New user manual released',
                    createdAt: date.setSeconds(date.getSeconds()+1),
                }
            ],
        },
        {
            include: [models.Message],
        }
    );
};

(async () => {
    await sequelize.authenticate();
    console.log(chalk.blue('Connection has been established succesfully.'));

    const isTest = !!process.env.TEST_DATABASE;

    await sequelize.sync({force: isTest });
    if(isTest) {
        await createUsersWithMessages(new Date());
        console.log(chalk.blue('Sample data created!'));
    }

    const server = new ApolloServer({
        typeDefs: schema,
        resolvers,
        formatError: error => {
            //remove the internal sequelize error message
            //leave only the  important validation error
            const message = error.message
            .replace('SequelizeValidationError: ','')
            .replace('Validation error: ','');
            return {
                ...error,
                message,
            };
        },
        context: async ({req, connection}) => {
            
            if (connection) {
                return {
                    models,
                };
            }

            if (req) {
                const me = await getMe(req);
                return {
                    models,
                    me,
                    secret: process.env.SECRET,
                };
            }
        },
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    app.listen({ port: 3001 },() => {
        console.log(chalk.blue('Apollo Server on http://localhost:3001/graphql'));
    });
})().catch(
    (reason) => console.log(chalk.red('An error occured: ',reason))
);
