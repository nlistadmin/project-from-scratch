import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorization.js';

export default {
    Query: {
        messages: async (parent, args , { models }) => {
            return await models.Message.findAll();
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