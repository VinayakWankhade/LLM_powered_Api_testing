import client from './client';

export const authApi = {
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await client.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await client.post('/auth/register', userData);
        return response.data;
    },

    verify: async () => {
        const response = await client.get('/auth/verify');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await client.patch('/auth/me', profileData);
        return response.data;
    },
};
