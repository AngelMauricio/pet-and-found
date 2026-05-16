import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/cloudflare";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const requestUid = decodedToken.uid;

    const { fileKey } = await request.json();

    const ownerUid = fileKey.split('/')[0];

    if (requestUid !== ownerUid) {
      return NextResponse.json({ error: "Forbidden: You don't own this file" }, { status: 403 });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    await r2Client.send(command);

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}