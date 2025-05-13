'use client';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Button, CircularProgress, Container, IconButton, TextField, Tooltip, Typography
} from '@mui/material';


export default function VaultDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        website: '',
        username: '',
        password: '',
        masterPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const masterPassword = sessionStorage.getItem("masterPassword");
        if (!masterPassword) {
            alert("Master password not found. Please go back and enter it again.");
            setLoading(false);
            return;
        }
        const res = await fetch('/api/vault/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: id, masterPassword: masterPassword }),
        });

        const result = await res.json();
        if (result.decryptedPassword) {
            setData({
                website: result.record.website,
                username: result.record.username,
                password: result.decryptedPassword,
                masterPassword: masterPassword,
            });
        } else {
            alert('Failed to decrypt password');
            router.push('/vault/view');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async () => {
        setLoading(true);
        const masterPassword = sessionStorage.getItem("masterPassword");
        if (!masterPassword) {
            alert("Master password not found. Please go back and enter it again.");
            setLoading(false);
            return;
        }
        const res = await fetch('/api/vault/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recordId: id,
                website: data.website,
                username: data.username,
                password: data.password,
                masterPassword: masterPassword,
            }),
        });

        if (res.ok) {
            alert('Updated successfully');
            router.push('/vault/view');
        } else {
            alert('Update failed');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Delete this record?')) return;
        setLoading(true);
        const res = await fetch('/api/vault/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: id }),
        });

        if (res.ok) {
            alert('Deleted');
            router.push('/vault/view');
        } else {
            alert('Delete failed');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={() => router.push('/vault/view')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" ml={1}>Edit Record</Typography>
            </Box>

            <TextField
                fullWidth
                label="Website"
                value={data.website}
                margin="normal"
                onChange={(e) => setData({ ...data, website: e.target.value })}
            />
            <TextField
                fullWidth
                label="Username"
                value={data.username}
                margin="normal"
                onChange={(e) => setData({ ...data, username: e.target.value })}
            />
            <TextField
                fullWidth
                label="Password"
                type="text"
                value={data.password}
                margin="normal"
                onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            <Box mt={2} display="flex" gap={2}>
                <Tooltip title="Copy Password">
                    <IconButton onClick={() => navigator.clipboard.writeText(data.password)}>
                        <ContentCopyIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Save Changes">
                    <IconButton color="primary" onClick={handleUpdate}>
                        <SaveIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete Record">
                    <IconButton color="error" onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Container>
    );
}