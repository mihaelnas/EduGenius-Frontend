
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, notFound } from 'next/navigation';
import type { Course } from '@/lib/placeholder-data';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function CourseDetailContent({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    
    const courseDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const { data: course, isLoading } = useDoc<Course>(courseDocRef);

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-9 w-40 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!course) {
        notFound();
        return null; 
    }

    return (
        <div>
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/teacher/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à mes cours
                </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                <p className="text-sm font-semibold text-primary">{course.subjectName}</p>
                <CardTitle className="text-3xl font-headline">{course.title}</CardTitle>
                {course.createdAt && (
                    <CardDescription>Publié le {new Date(course.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
                )}
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{course.content}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function TeacherCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  if (!courseId) {
    return <p>ID de cours non trouvé.</p>
  }

  return <CourseDetailContent courseId={courseId} />;
}
