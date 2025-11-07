'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, notFound, useRouter } from 'next/navigation';
import type { Course } from '@/lib/placeholder-data';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type WithId<T> = T & { id: string };

function CourseDetailContent({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [course, setCourse] = useState<WithId<Course> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!user || !firestore || !courseId) {
            // Wait for user and firestore to be available
            if (!isUserLoading && !user) {
                router.push('/login');
            }
            return;
        }

        setIsLoading(true);
        const courseDocRef = doc(firestore, 'courses', courseId);

        const unsubscribe = onSnapshot(courseDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Course;
                if (data.teacherId !== user.uid) {
                     setError("Vous n'avez pas la permission de voir ce cours.");
                } else {
                    setCourse({ ...data, id: docSnap.id });
                    setError(null);
                }
            } else {
                setError("Le cours demandé n'a pas été trouvé.");
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Erreur de récupération Firestore:", err);
            setError("Une erreur est survenue lors du chargement du cours.");
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

    }, [firestore, courseId, user, isUserLoading, router]);

    if (isLoading || isUserLoading) {
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
    
    if (error) {
        // Instead of 404, show an error message.
        return (
             <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-destructive">Erreur</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                 <Button asChild variant="outline" size="sm" className="mt-6">
                    <Link href="/dashboard/teacher/courses">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à mes cours
                    </Link>
                </Button>
            </div>
        )
    }

    if (!course) {
        // This case will be hit if the document does not exist after loading.
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
