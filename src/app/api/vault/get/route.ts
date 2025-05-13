
import { NextRequest, NextResponse } from 'next/server';
import { decryptData, deriveKey } from '@/utils/encryption'; // Your AES decryption logic
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import VaultModel from '@/models/PasswordRecord';

export async function POST(req: NextRequest) {
   
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { recordId, masterPassword } = await req.json();

    const record = await VaultModel.findById(recordId);

    if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    try {
        const key = deriveKey(masterPassword, record.salt);
        const decryptedPassword = decryptData(record.encryptedPassword, key, record.iv, record.authTag);
        return NextResponse.json({
            decryptedPassword,
            record: {
                _id: record._id,
                website: record.website,
                username: record.username,
            }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Decryption failed' }, { status: 400 });
    }
}
