'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  courses,
  subjects,
  Resource,
} from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Paperclip, Video, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

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
  const courseId = params.id as string;

  const course = React.useMemo(() => courses.find(c => c.id === courseId), [courseId]);
  const subject = React.useMemo(() => {
    if (!course) return null;
    return subjects.find(s => s.id === course.subjectId);
  }, [course]);

  if (!course || !subject) {
    notFound();
    return null;
  }

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
          <p className="text-sm font-semibold text-primary">{subject.name}</p>
          <CardTitle className="text-3xl font-headline">{course.title}</CardTitle>
          <CardDescription>Publié le {new Date(course.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{course.content}</p>
          </div>

          {course.resources.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 font-headline">Ressources du cours</h3>
              <div className="space-y-3">
                {course.resources.map(resource => (
                  <a
                    key={resource.id}
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
