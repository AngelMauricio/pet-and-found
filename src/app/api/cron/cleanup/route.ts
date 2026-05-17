import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

        const snapshot = await adminDb
            .collection('reports')
            .where('createdAt', '<=', twoMonthsAgo)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ message: 'No old reports found' });
        }

        const batch = adminDb.batch();
        let deletedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const images = data.images || [];

            for (const imgUrl of images) {
                try {
                    const url = new URL(imgUrl);
                    const fileKey = url.pathname.substring(1);

                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: fileKey,
                    }));
                } catch (r2Error) {
                    console.error(`Failed to delete image ${imgUrl} from R2:`, r2Error);
                }
            }

            batch.delete(doc.ref);
            deletedCount++;
        }

        await batch.commit();

        return NextResponse.json({ 
            success: true, 
            deletedCount 
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}