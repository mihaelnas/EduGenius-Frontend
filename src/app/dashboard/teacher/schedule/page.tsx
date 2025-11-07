
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, Video, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { format, isSameDay, startOfWeek, addDays, subDays } from 'date-fns';
import { ScheduleEvent, getDisplayName, AppUser, Class, Subject } from '@/lib/placeholder-data';
import { AddEventDialog } from '@/components/teacher/add-event-dialog';
import { EditEventDialog } from '@/components/teacher/edit-event-dialog';
import { DeleteConfirmationDialog } from '@/components/admin/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusVariant: { [key in ScheduleEvent['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'planifié': 'default',
  'effectué': 'secondary',
  'reporté': 'outline',
  'annulé': 'destructive',
};

const DayColumn = ({ day, events, getTeacherName, onEdit, onDelete }: { day: Date; events: ScheduleEvent[]; getTeacherName: (id: string) => string; onEdit: (event: ScheduleEvent) => void; onDelete: (event: ScheduleEvent) => void; }) => {
  const dayEvents = events
    .filter(event => isSameDay(new Date(event.date), day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex-1 space-y-4">
      <div className="text-center pb-2 border-b">
        <p className="font-semibold text-lg capitalize">{format(day, 'EEEE', { locale: fr })}</p>
        <p className="text-sm text-muted-foreground">{format(day, 'd MMMM', { locale: fr })}</p>
      </div>
      <div className="space-y-3 px-2 min-h-[200px]">
        {dayEvents.length > 0 ? (
          dayEvents.map(event => (
            <Card key={event.id} className="w-full shadow-sm hover:shadow-md transition-shadow">
               <CardContent className="p-3 space-y-2 relative">
                <div className="absolute top-1 right-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEdit(event)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(event)} className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <p className="font-semibold pr-6">{event.subject}</p>
                <p className="text-xs text-muted-foreground">{event.startTime} - {event.endTime}</p>
                <div className='flex flex-wrap gap-1'>
                    <Badge variant={event.type === 'en-ligne' ? 'secondary' : 'outline'} className="capitalize">{event.type === 'en-ligne' ? 'En ligne' : 'En salle'}</Badge>
                    <Badge variant={statusVariant[event.status]} className="capitalize">{event.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1 text-muted-foreground">
                    <span>{event.class}</span>
                </div>
                {event.type === 'en-ligne' && event.conferenceLink && (
                    <Button asChild size="sm" className="w-full mt-2">
                      <Link href={event.conferenceLink} target="_blank">
                        <Video className="mr-2 h-4 w-4" />
                        Rejoindre
                      </Link>
                    </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center pt-4">Aucun cours</p>
        )}
      </div>
    </div>
  );
};

export default function TeacherSchedulePage() {
  const [week, setWeek] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = React.useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<ScheduleEvent | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const scheduleQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'schedule'), where('teacherId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: schedule, isLoading: isLoadingSchedule } = useCollection<ScheduleEvent>(scheduleQuery);
  
  const teacherClassesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'classes'), where('teacherIds', 'array-contains', user.uid)) : null,
    [user, firestore]
  );
  const { data: teacherClasses, isLoading: isLoadingClasses } = useCollection<Class>(teacherClassesQuery);

  const teacherSubjectsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'subjects'), where('teacherId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: teacherSubjects, isLoading: isLoadingSubjects } = useCollection<Subject>(teacherSubjectsQuery);

  const handleEventAdded = async (newEventData: Omit<ScheduleEvent, 'id' | 'teacherId'>) => {
    if (!user) return;
    const scheduleCollectionRef = collection(firestore, 'schedule');
    await addDoc(scheduleCollectionRef, { ...newEventData, teacherId: user.uid });
    toast({ title: 'Événement ajouté avec succès.' });
  };
  
  const handleEventUpdated = async (updatedEventData: ScheduleEvent) => {
    const eventDocRef = doc(firestore, 'schedule', updatedEventData.id);
    await updateDoc(eventDocRef, updatedEventData);
    toast({ title: 'Événement mis à jour avec succès.' });
  };

  const handleOpenEdit = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  };

  const handleOpenDelete = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    const eventDocRef = doc(firestore, 'schedule', selectedEvent.id);
    await deleteDoc(eventDocRef);
    toast({ variant: 'destructive', title: 'Événement supprimé.' });
    setIsDeleteDialogOpen(false);
    setSelectedEvent(null);
  };

  const getTeacherName = (id: string): string => {
    // Since this is the teacher's own schedule, we can just return their name.
    return user?.displayName || 'Moi';
  };

  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(week, i));
  const isLoading = isLoadingSchedule || isLoadingClasses || isLoadingSubjects;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Mon Emploi du Temps</h1>
          <p className="text-muted-foreground">Gérez votre planning hebdomadaire.</p>
        </div>
        <Button onClick={() => setIsAddEventDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un événement
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Semaine du {format(week, 'd MMMM yyyy', { locale: fr })}</CardTitle>
          <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setWeek(subDays(week, 7))}>
                  <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWeek(addDays(week, 7))}>
                  <ChevronRight className="h-4 w-4" />
              </Button>
          </div>
        </CardHeader>
        <CardContent>
           {isLoading ? (
              <div className="flex divide-x rounded-lg border">
                  {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="flex-1 space-y-4">
                           <div className="text-center pb-2 border-b p-2">
                              <Skeleton className="h-6 w-24 mx-auto" />
                              <Skeleton className="h-4 w-20 mx-auto mt-1" />
                           </div>
                           <div className="p-2 space-y-3">
                              <Skeleton className="h-28 w-full" />
                           </div>
                      </div>
                  ))}
              </div>
           ) : (
            <div className="flex divide-x rounded-lg border bg-muted/20">
              {daysOfWeek.map(day => (
                  <DayColumn 
                      key={day.toISOString()} 
                      day={day} 
                      events={schedule || []}
                      getTeacherName={getTeacherName}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                  />
              ))}
            </div>
           )}
        </CardContent>
      </Card>

      <AddEventDialog 
        isOpen={isAddEventDialogOpen}
        setIsOpen={setIsAddEventDialogOpen}
        onEventAdded={handleEventAdded}
        teacherClasses={teacherClasses || []}
        teacherSubjects={teacherSubjects || []}
      />
      {selectedEvent && (
        <EditEventDialog
          isOpen={isEditEventDialogOpen}
          setIsOpen={setIsEditEventDialogOpen}
          onEventUpdated={handleEventUpdated}
          eventData={selectedEvent}
          teacherClasses={teacherClasses || []}
          teacherSubjects={teacherSubjects || []}
        />
      )}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedEvent ? `le cours de ${selectedEvent.subject}` : 'l\'événement'}
        itemType="cet événement"
      />
    </>
  );
}
