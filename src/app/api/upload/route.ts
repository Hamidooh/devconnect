import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Vercel Blob token is configured, use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(file.name, buffer, { access: "public" });
        return NextResponse.json({ url: blob.url });
      } catch (blobErr) {
        console.error("Vercel Blob upload failed, falling back to base64:", blobErr);
      }
    }

    // 2. In local development, try saving to public/uploads
    if (process.env.NODE_ENV === "development") {
      try {
        const { writeFile, mkdir } = await import("fs/promises");
        const { join } = await import("path");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}` });
      } catch (fsErr) {
        console.error("Local disk upload failed, falling back to data URL:", fsErr);
      }
    }

    // 3. Fallback: Base64 Data URL (Works 100% on Vercel without read-only filesystem errors)
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
