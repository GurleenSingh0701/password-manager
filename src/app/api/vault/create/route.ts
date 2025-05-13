import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options'; // Adjust path if needed
import connectDB from '@/lib/mongodb';
import PasswordRecord from '@/models/PasswordRecord';
import { deriveKey, encryptData } from '@/utils/encryption';
import crypto from 'crypto';
import User from '@/models/User'; // Adjust path if needed
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { website, username, password, masterPassword } = body;

    if (!website || !username || !password || !masterPassword) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        await connectDB();
        const salt = crypto.randomBytes(16).toString('hex');
        const key = deriveKey(masterPassword, salt);
        const { encryptedData, iv, authTag } = encryptData(password, key);
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const record = await PasswordRecord.create({
            userId: user._id,
            website,
            username,
            encryptedPassword: encryptedData,
            iv,
            authTag,
            salt,
        });

        return NextResponse.json({ success: true, record }, { status: 201 });
    } catch (error) {
        console.error('[Vault Create] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
