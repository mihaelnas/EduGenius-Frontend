'use client';

import React from 'react';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { TeacherDashboard } from '@/components/dashboards/teacher-dashboard';
import { StudentDashboard } from '@/components/dashboards/student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { AppUser, Class, Subject } from '@/lib/placeholder-data';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          // Handle case where user doc doesn't exist
          setUserRole('student'); // Default or error handling
        }
      });
    }
  }, [user, firestore]);
  
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const classesQuery = useMemoFirebase(() => collection(firestore, 'classes'), [firestore]);
  const subjectsQuery = useMemoFirebase(() => collection(firestore, 'subjects'), [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<AppUser>(usersQuery);
  const { data: classes, isLoading: classesLoading } = useCollection<Class>(classesQuery);
  const { data: subjects, isLoading: subjectsLoading } = useCollection<Subject>(subjectsQuery);


  const renderDashboard = () => {
    if (isUserLoading || !userRole || usersLoading || classesLoading || subjectsLoading) {
       return (
          <>
            <Skeleton className="h-8 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-80 xl:col-span-2" />
                <Skeleton className="h-80" />
            </div>
          </>
        );
    }

    switch (userRole) {
      case 'admin':
        return <AdminDashboard userName={user?.displayName} users={users || []} classes={classes || []} subjects={subjects || []} />;
      case 'teacher':
        return <TeacherDashboard userName={user?.displayName} />;
      case 'student':
        return <StudentDashboard userName={user?.displayName} />;
      default:
        return <p>Rôle non reconnu.</p>;
    }
  };

  return <>{renderDashboard()}</>;
}
