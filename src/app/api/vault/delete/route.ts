
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import VaultModel from '@/models/PasswordRecord';
import connectDB from '@/lib/mongodb';
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId } = await req.json();
    await connectDB();
    const deleted = await VaultModel.findOneAndDelete({ _id: recordId });

    if (!deleted) {
        return NextResponse.json({ error: 'Record not found or deletion failed' }, { status: 400 });
    }

    return NextResponse.json({
        message: 'Record deleted successfully',

    });
}
