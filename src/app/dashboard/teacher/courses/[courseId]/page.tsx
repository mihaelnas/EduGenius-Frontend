
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, notFound } from 'next/navigation';
import type { Course } from '@/lib/placeholder-data';

function DiagnosticCoursePage({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    
    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const { data: course, isLoading, error } = useDoc<Course>(courseDocRef);

    return (
        <div>
            <h1>Page de Diagnostic du Cours</h1>
            <p>ID du cours (depuis l'URL): {courseId}</p>
            <p>ID de l'utilisateur connecté: {user?.uid || 'Non connecté'}</p>
            <p>Référence du document Firestore: {courseDocRef?.path || 'N/A'}</p>
            <hr style={{ margin: '1rem 0' }} />
            <h2>État de la récupération des données :</h2>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Chargement (isLoading): {JSON.stringify(isLoading, null, 2)}
                <br />
                Erreur: {JSON.stringify(error, null, 2)}
            </pre>
            <hr style={{ margin: '1rem 0' }} />
            <h2>Données brutes du cours :</h2>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>{course ? JSON.stringify(course, null, 2) : 'Pas de données'}</pre>
            
            {course && (
                <>
                    <hr style={{ margin: '1rem 0' }} />
                    <h2>Champs spécifiques :</h2>
                    <p>Titre: {course.title}</p>
                    <p>Contenu: {course.content}</p>
                </>
            )}
        </div>
    );
}


export default function TeacherCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div>
        <h1>Chargement de l'utilisateur...</h1>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (!user) {
    // This case should be handled by the layout, but as a safeguard
    return <p>Veuillez vous connecter pour voir ce cours.</p>
  }
  
  // Render the detail component only if we have a courseId
  return courseId ? <DiagnosticCoursePage courseId={courseId} /> : <p>ID de cours manquant.</p>;
}
