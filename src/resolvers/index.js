import pkg from 'graphql-iso-date'; //Does not work if I try to import named export.  Things must have changed since
//wieruch  wrote his book.  Strange that the npmjs page does not mention this?
const {  GraphQLDateTime } = pkg;

import userResolvers from './user.js';
import messageResolvers from './message.js';

const customScalarResolver = {
    Date: GraphQLDateTime,
}

export default [
    customScalarResolver,
    userResolvers, 
    messageResolvers
];