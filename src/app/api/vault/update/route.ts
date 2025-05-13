// Update a password record
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import connectDB from '@/lib/mongodb';
import PasswordRecord from '@/models/PasswordRecord';
import { deriveKey, encryptData } from '@/utils/encryption';

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recordId, website, username, password, masterPassword } = await req.json();

    if (!recordId || !password || !masterPassword) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existingRecord = await PasswordRecord.findById(recordId);
    if (!existingRecord) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const key = deriveKey(masterPassword, existingRecord.salt);
    const { encryptedData, iv, authTag } = encryptData(password, key);

    existingRecord.website = website;
    existingRecord.username = username;
    existingRecord.encryptedPassword = encryptedData;
    existingRecord.iv = iv;
    existingRecord.authTag = authTag;

    await existingRecord.save();

    return NextResponse.json({ success: true, record: existingRecord });
}






// import { NextRequest, NextResponse } from 'next/server';
// import { deriveKey, encryptData } from '@/utils/encryption';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]/options';
// import VaultModel from '@/models/PasswordRecord';

// export async function PUT(req: NextRequest) {

//     // const session = await getServerSession(authOptions);
//     //     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     //     const { recordId, website, username, password, masterPassword } = await req.json();

//     //     if (!recordId || !password || !masterPassword) {
//     //         return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     //     }

//     //     await connectDB();

//     //     const existingRecord = await PasswordRecord.findById(recordId);
//     //     if (!existingRecord) {
//     //         return NextResponse.json({ error: 'Record not found' }, { status: 404 });
//     //     }

//     //     const key = deriveKey(masterPassword, existingRecord.salt);
//     //     const { encryptedData, iv, authTag } = encryptData(password, key);

//     //     existingRecord.website = website;
//     //     existingRecord.username = username;
//     //     existingRecord.encryptedPassword = encryptedData;
//     //     existingRecord.iv = iv;
//     //     existingRecord.authTag = authTag;

//     //     await existingRecord.save();

//     //     return NextResponse.json({ success: true, record: existingRecord });



//     const session = await getServerSession(authOptions);
//     if (!session) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { recordId, website, username, password, masterPassword } = await req.json();

//     try {
//         const key = deriveKey(masterPassword, existingRecord.salt);
//         const { encryptedData, iv, authTag } = encryptData(password, key);
//         const updated = await VaultModel.findOneAndUpdate(
//             { _id: recordId },
//             { website, username, password: encryptedData },
//             { new: true }
//         );

//         if (!updated) {
//             return NextResponse.json({ error: 'Update failed' }, { status: 400 });
//         }

//         return NextResponse.json({
//             message: 'Updated successfully',
//             record: updated,
//         });
//     } catch (err) {
//         return NextResponse.json({ error: 'Encryption or update failed' }, { status: 500 });
//     }
// }
