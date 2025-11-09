
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Helper function to initialize Firebase Admin SDK
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Explicitly build the service account credential from environment variables.
  const serviceAccount: ServiceAccount = {
    projectId: process.env.GCP_PROJECT_ID,
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: (process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Handles DELETE requests to delete a user from Firebase Authentication.
 * Route: /api/users/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  try {
    initializeAdminApp();
    await admin.auth().deleteUser(userId);
    return NextResponse.json({ success: true, message: `Successfully deleted user ${userId}` }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete auth user ${userId}:`, error);

    let errorMessage = 'The user could not be deleted.';
    let statusCode = 500;

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Authentication user not found.';
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
