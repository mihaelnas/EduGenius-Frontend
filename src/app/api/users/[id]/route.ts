
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // automatically provided by Firebase App Hosting.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    // If it still fails, it's a server configuration issue.
  }
}

// Handler for DELETE requests
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await admin.auth().deleteUser(userId);
    return NextResponse.json({ success: true, message: `Successfully deleted user ${userId}` }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete user ${userId}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}

// Handler for PATCH requests
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { email, disabled } = body;

        const updatePayload: { email?: string; disabled?: boolean } = {};
        if (email) updatePayload.email = email;
        if (typeof disabled === 'boolean') updatePayload.disabled = disabled;
        
        if (Object.keys(updatePayload).length === 0) {
            return NextResponse.json({ error: 'No update payload provided' }, { status: 400 });
        }
        
        await admin.auth().updateUser(userId, updatePayload);

        return NextResponse.json({ success: true, message: `Successfully updated user ${userId}` }, { status: 200 });

    } catch (error: any) {
        console.error(`Failed to update user ${userId}:`, error);
        return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
    }
}
