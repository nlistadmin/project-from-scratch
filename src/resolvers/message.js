import { combineResolvers } from 'graphql-resolvers';
import Sequelize from 'sequelize';

import { isAuthenticated, isMessageOwner } from './authorization.js';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string => Buffer.from(string,'base64').toString('ascii');

export default {
    Query: {
        messages: async (
            parent, 
            { cursor, limit = 100 },
            { models }
        ) => { 
            const cursorOptions = cursor
            ? {
                where: {
                    createdAt: {
                        [Sequelize.Op.lt]: fromCursorHash(cursor),
                    },
                },
            }
            : {};
            //rwieruch's book doesn't have the limit tests in.
            const messages = await models.Message.findAll({
                order: [['createdAt', 'DESC']],
                limit: limit?limit +  1:null,
                ...cursorOptions,
            });

            const hasNextPage =  (messages.length > limit)&&(limit!=null);
            const edges = hasNextPage? messages.slice(0,-1) : messages;

            return {
                edges,
                pageInfo: {
                    hasNextPage,
                    endCursor: toCursorHash(
                        edges[edges.length-1].createdAt.toString(),
                    ),
                }
            }
        },
        message: async (parent, { id }, { models }) => {
            return await models.Message.findByPk(id);
        },
    },
        

    Mutation: {
        createMessage: combineResolvers(
            isAuthenticated,
            async (parent, { text }, { me, models }) => {
                try {
                    return await models.Message.create({
                        text,
                        userId: me.id,
                    })
                } catch (error) {
                    throw new Error(error);
                }
            },
        ),
        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async (parent, { id }, { models }) => {
                return await models.Message.destroy({where: {id}});
            }
        ),
        updateMessage: async (parent, { id, text }, { models }) => {
            const result = await models.Message.update({
                text: text,
            },
            {
                where: {id}
            });

            if (result[0]) {
                console.log('result[0]=true')
                return await models.Message.findByPk(id);
            } else {
                return null;
            }
        },
    },

    Message: {
        user: async (message, args, { models}) => {
            return await models.User.findByPk(message.userId);
        }
    }
}