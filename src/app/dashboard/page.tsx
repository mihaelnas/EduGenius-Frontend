'use client';

import React from 'react';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { TeacherDashboard } from '@/components/dashboards/teacher-dashboard';
import { StudentDashboard } from '@/components/dashboards/student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser, Class, Subject } from '@/lib/placeholder-data';
import { users as initialUsers, classes as initialClasses, subjects as initialSubjects } from '@/lib/placeholder-data';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  
  // These states are now managed here to make dashboards dynamic
  const [users, setUsers] = React.useState<AppUser[]>(initialUsers);
  const [classes, setClasses] = React.useState<Class[]>(initialClasses);
  const [subjects, setSubjects] = React.useState<Subject[]>(initialSubjects);

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

  const renderDashboard = () => {
    if (isUserLoading || !userRole) {
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
        return <AdminDashboard userName={user?.displayName} users={users} classes={classes} subjects={subjects} />;
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
