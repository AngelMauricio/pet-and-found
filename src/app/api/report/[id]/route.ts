import { NextResponse } from "next/server";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/cloudflare";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from 'next/cache';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const requestUid = decodedToken.uid;

        const { id: reportId } = await params;

        const reportRef = adminDb.collection('reports').doc(reportId);
        const reportSnap = await reportRef.get();

        if (!reportSnap.exists) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const reportData = reportSnap.data();

        if (reportData?.userId !== requestUid) {
            return NextResponse.json({ error: "Forbidden: You don't own this report" }, { status: 403 });
        }

        const images = reportData?.images || [];
        if (images.length > 0) {
            const objectsToDelete = images.map((imgUrl: string) => {
                const url = new URL(imgUrl);
                const fileKey = url.pathname.substring(1); 
                return { Key: fileKey };
            });

            const command = new DeleteObjectsCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Delete: { Objects: objectsToDelete }
            });

            await r2Client.send(command);
        }

        await reportRef.delete();

        revalidatePath(`/[locale]/pet/${reportId}`, 'page');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error in delete report API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}