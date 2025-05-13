
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import connectDB from '@/lib/mongodb';
import PasswordRecord from '@/models/PasswordRecord';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Optional: Look up user ID from email (if you're using ObjectId in PasswordRecord)
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const records = await PasswordRecord.find({ userId: user._id });

        return NextResponse.json({ records });
    } catch (error) {
        console.error('[Vault View] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
