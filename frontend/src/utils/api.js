import client from '../api/client';

export const authApi = {
    verifyToken: (token) => client.post('/auth/verify/', {}),
};

export const documentApi = {
    list: () => client.get('/documents/'),
    upload: (formData) => client.post('/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDetail: (id) => client.get(`/documents/${id}/`),
    delete: (id) => client.delete(`/documents/${id}/`),
    getStatus: (id) => client.get(`/documents/${id}/status/`),
    getSummary: (id) => client.get(`/documents/${id}/summary/`),
};

export const chatApi = {
    getHistory: (docId) => client.get(`/chat/${docId}/`),
    sendMessage: (docId, message) => client.post(`/chat/${docId}/`, { message }),
    clearHistory: (docId) => client.delete(`/chat/${docId}/`),
};
