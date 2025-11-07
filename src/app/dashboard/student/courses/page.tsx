'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { studentSubjects, studentCourses } from '@/lib/placeholder-data';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentCoursesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight font-headline">Mes Cours</h1>
      <p className="text-muted-foreground">Accédez ici à tous vos supports de cours et contenus.</p>
      <div className="mt-6">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {studentSubjects.map(subject => (
            <AccordionItem key={subject.id} value={`item-${subject.id}`} className="border-b-0 rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline px-6 py-4">
                {subject.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pt-2 border-t">
                  {studentCourses.filter(c => c.subjectId === subject.id).map(course => (
                    <Link
                      key={course.id}
                      href={`/dashboard/student/courses/${course.id}`}
                      className="flex items-center justify-between gap-3 p-4 mx-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                         <BookOpen className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground/80">{course.title}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  ))}
                   {studentCourses.filter(c => c.subjectId === subject.id).length === 0 && (
                      <p className="px-6 py-4 text-sm text-muted-foreground">Aucun cours disponible pour cette matière.</p>
                   )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
