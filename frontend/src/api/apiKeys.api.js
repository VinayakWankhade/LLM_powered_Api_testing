import client from './client';

export const apiKeysApi = {
    list: async () => {
        const response = await client.get('/auth/api-keys');
        return response.data;
    },

    create: async (keyData) => {
        const response = await client.post('/auth/api-keys', keyData);
        return response.data;
    },

    revoke: async (keyId) => {
        const response = await client.delete(`/auth/api-keys/${keyId}`);
        return response.data;
    },
};
