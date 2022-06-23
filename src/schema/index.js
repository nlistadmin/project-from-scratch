import { gql } from 'apollo-server-express';

import userSchema from './user.js';
import messageSchema from './message.js';

const linkSchema = gql`
  scalar Date

  type Query {
      _: Boolean
    }

    type Mutation {
      _: Boolean
    }

    type Subscription {
      _: Boolean
    }
`;

export default [linkSchema, userSchema, messageSchema];