import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    // In a real app we'd check if the user is the owner of the playground
    
    // Attempt to fetch secrets
    const secrets = await prisma.secret.findMany({
      where: { playgroundId: params.id },
    });

    // Decrypt the values before sending to client
    const decryptedSecrets = secrets.map((secret: any) => ({
      id: secret.id,
      key: secret.key,
      value: decrypt(secret.value),
      createdAt: secret.createdAt,
    }));

    return NextResponse.json(decryptedSecrets);
  } catch (error) {
    console.error("Failed to fetch secrets:", error);
    // If DB fails (e.g. no connection string), return empty array so UI doesn't crash
    return NextResponse.json([]);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof value !== "string") {
      return new NextResponse("Missing key or value", { status: 400 });
    }

    // Encrypt the value
    const encryptedValue = encrypt(value);

    // Upsert the secret (create or update)
    const secret = await prisma.secret.upsert({
      where: {
        playgroundId_key: {
          playgroundId: params.id,
          key: key,
        },
      },
      update: {
        value: encryptedValue,
      },
      create: {
        playgroundId: params.id,
        key: key,
        value: encryptedValue,
      },
    });

    return NextResponse.json({
      id: secret.id,
      key: secret.key,
      value: decrypt(secret.value), // return decrypted to frontend
    });
  } catch (error) {
    console.error("Failed to save secret:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing key", { status: 400 });
    }

    await prisma.secret.delete({
      where: {
        playgroundId_key: {
          playgroundId: params.id,
          key: key,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete secret:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
