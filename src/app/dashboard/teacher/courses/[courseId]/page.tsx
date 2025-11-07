
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, notFound } from 'next/navigation';
import type { Course } from '@/lib/placeholder-data';

function CourseDetailContent({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    
    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const { data: course, isLoading } = useDoc<Course>(courseDocRef);

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (!course) {
        notFound();
        return null;
    }

    return (
        <div>
            <h2>Titre: {course.title}</h2>
            <p>Contenu: {course.content}</p>
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
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (!user) {
    return <p>Veuillez vous connecter pour voir ce cours.</p>
  }
  
  return courseId ? <CourseDetailContent courseId={courseId} /> : <p>ID de cours manquant.</p>;
}
