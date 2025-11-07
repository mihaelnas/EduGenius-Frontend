
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound, useParams } from 'next/navigation';
import type { Course } from '@/lib/placeholder-data';

function CourseDetailContent({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    
    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const { data: course, isLoading: isLoadingCourse } = useDoc<Course>(courseDocRef);

    if (isLoadingCourse) {
        return (
            <div>
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    // This is the critical part: only call notFound() after loading is complete and we confirm no data.
    if (!course) {
        notFound();
        return null; 
    }

    // Minimal display as requested
    return (
        <div>
            <h1>Titre: {course.title}</h1>
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
  return courseId ? <CourseDetailContent courseId={courseId} /> : <p>ID de cours manquant.</p>;
}
