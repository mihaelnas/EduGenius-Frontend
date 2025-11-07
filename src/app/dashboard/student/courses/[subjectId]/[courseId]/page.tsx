
'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Course,
  Resource,
} from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Paperclip, Video, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const ResourceIcon = ({ type }: { type: Resource['type'] }) => {
  switch (type) {
    case 'pdf':
      return <Paperclip className="h-5 w-5 text-primary" />;
    case 'video':
      return <Video className="h-5 w-5 text-primary" />;
    case 'link':
      return <LinkIcon className="h-5 w-5 text-primary" />;
    default:
      return null;
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const subjectId = params.subjectId as string; // Ajout pour le débogage
  const firestore = useFirestore();

  console.log(`[CourseDetailPage] Rendu de la page avec les paramètres : courseId=${courseId}, subjectId=${subjectId}`);

  const courseDocRef = useMemoFirebase(() => {
    if (courseId) {
      console.log(`[CourseDetailPage] Création de la référence Firestore pour : courses/${courseId}`);
      return doc(firestore, 'courses', courseId);
    }
    console.log('[CourseDetailPage] courseId est manquant, impossible de créer la référence Firestore.');
    return null;
  }, [firestore, courseId]);

  const { data: course, isLoading: isLoadingCourse, error: courseError } = useDoc<Course>(courseDocRef);

  console.log('[CourseDetailPage] Résultat du hook useDoc :', { course, isLoadingCourse, courseError });

  if (isLoadingCourse) {
    console.log('[CourseDetailPage] Affichage du squelette de chargement.');
    return (
        <div>
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full" />
                    <div className="mt-8">
                         <Skeleton className="h-6 w-1/3 mb-4" />
                         <div className="space-y-3">
                             <Skeleton className="h-12 w-full" />
                             <Skeleton className="h-12 w-full" />
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  // Si le chargement est terminé et qu'il n'y a pas de cours, alors 404
  if (!isLoadingCourse && !course) {
    console.error(`[CourseDetailPage] Erreur 404 déclenchée. isLoadingCourse: ${isLoadingCourse}, course:`, course);
    notFound();
    return null; // notFound() interrompt le rendu, mais c'est une bonne pratique.
  }
  
  // Cette vérification est maintenant sécurisée
  if (!course) return null;


  return (
    <div>
        <div className="mb-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Tableau de bord</Link>
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard/student/courses">Mes Cours</Link>
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                         <span className="font-medium text-foreground">{course.title}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
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

          {course.resources && course.resources.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 font-headline">Ressources du cours</h3>
              <div className="space-y-3">
                {course.resources.map((resource, index) => (
                  <a
                    key={resource.id || index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                        <ResourceIcon type={resource.type} />
                        <span className="font-medium">{resource.title}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
