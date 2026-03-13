import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export default function useDocument(documentId) {
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDocument = useCallback(async () => {
        if (!documentId) return;
        try {
            setLoading(true);
            const res = await client.get(`/documents/${documentId}/`);
            if (res.data.success) {
                setDocument(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch document');
        } finally {
            setLoading(false);
        }
    }, [documentId]);

    const pollStatus = useCallback(async () => {
        if (!documentId) return null;
        try {
            const res = await client.get(`/documents/${documentId}/status/`);
            if (res.data.success) {
                return res.data.data;
            }
        } catch {
            return null;
        }
    }, [documentId]);

    const fetchSummary = useCallback(async () => {
        if (!documentId) return null;
        try {
            const res = await client.get(`/documents/${documentId}/summary/`);
            if (res.data.success) {
                return res.data.data;
            }
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to fetch summary');
        }
    }, [documentId]);

    const deleteDocument = useCallback(async () => {
        if (!documentId) return;
        try {
            await client.delete(`/documents/${documentId}/`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to delete document');
        }
    }, [documentId]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    return {
        document,
        loading,
        error,
        fetchDocument,
        pollStatus,
        fetchSummary,
        deleteDocument,
    };
}
