import { expect } from 'chai';

import * as userAPI from './api.js';

describe('users', ()=>{
    describe('user(id:String!): User', () => {
        it('returns a user when user can be found', async () => {
            const expectedResult = {
                data: {
                    user: {
                        id: '1',
                        username: 'rwieruch',
                        email: 'hello@robin.com',
                        role: 'ADMIN',
                    }
                },
            };

            const result = await userAPI.user({ id: '1' });

            expect(result.data).to.eql(expectedResult);
        });

        it('returns null when user cannot be found', async () => {
            const expectedResult = {
                data: {
                    user: null,
                },
            };
        
            const result = await userAPI.user({id:'42'});
        
            expect(result.data).to.eql(expectedResult);
        });        
    });

    describe('deleteUser(id: String!): Boolean!', () => {
        it('returns an error because only admins can delete a user', async ()=> {
            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await userAPI.signIn({
                login: 'ddavids',
                password: 'ddavids',
            });
    
            const {
                data: { errors },
            } = await userAPI.deleteUser({id:'1'},token);
    
            expect(errors[0].message).to.eql('Not authorized as admin.');
        });
    });
});



  