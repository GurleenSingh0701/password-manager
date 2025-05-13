'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
    Alert,
} from '@mui/material';

export default function CreateVaultEntry() {
    const [website, setWebsite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        setError('');

        const res = await fetch('/api/vault/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ website, username, password, masterPassword }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            setStatus('Password saved successfully!');
            setTimeout(() => router.push('/vault/view'), 1500);
        } else if (data.error === 'Unauthorized') {
            setError('Unauthorized access. Please check your master password.');
        } else {
            setError(data.error || 'Failed to save password.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Create Password Record
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <TextField
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Master Password"
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    required
                    fullWidth
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </Box>
            {status && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {status}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Container>
    );
}