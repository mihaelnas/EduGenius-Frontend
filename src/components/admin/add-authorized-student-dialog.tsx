
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  matricule: z.string().min(1, { message: 'Le matricule est requis.' }),
  firstName: z.string().min(1, { message: 'Le prénom est requis.' }),
  lastName: z.string().min(1, { message: 'Le nom est requis.' }),
});

export type AddAuthorizedStudentFormValues = z.infer<typeof formSchema>;

type AddAuthorizedStudentDialogProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onStudentAdded: (newStudent: AddAuthorizedStudentFormValues) => Promise<void>;
};

export function AddAuthorizedStudentDialog({ isOpen, setIsOpen, onStudentAdded }: AddAuthorizedStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const form = useForm<AddAuthorizedStudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricule: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (values: AddAuthorizedStudentFormValues) => {
    // Check for uniqueness
    const authStudentsRef = collection(firestore, 'authorized_students');
    const q = query(authStudentsRef, where('matricule', '==', values.matricule.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      form.setError('matricule', { type: 'manual', message: 'Ce matricule existe déjà dans la liste.' });
      return;
    }

    await onStudentAdded({
        ...values,
        matricule: values.matricule.toUpperCase(),
        lastName: values.lastName.toUpperCase(),
        firstName: values.firstName.charAt(0).toUpperCase() + values.firstName.slice(1).toLowerCase(),
    });
    setIsOpen(false);
    form.reset();
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const handleMatriculeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      form.setValue('matricule', value.toUpperCase(), { shouldValidate: true });
    }
  };
  
  const handlePrenomBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      form.setValue('firstName', value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(), { shouldValidate: true });
    }
  };

  const handleNomBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      form.setValue('lastName', value.toUpperCase(), { shouldValidate: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un étudiant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un étudiant à la liste d'admission</DialogTitle>
          <DialogDescription>
            Les étudiants sur cette liste pourront s'inscrire et leur compte sera validé automatiquement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="matricule" render={({ field }) => ( <FormItem><FormLabel>Matricule</FormLabel><FormControl><Input placeholder="E1234567" {...field} onBlur={handleMatriculeBlur} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>Prénom</FormLabel><FormControl><Input placeholder="Jean" {...field} onBlur={handlePrenomBlur} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="DUPONT" {...field} onBlur={handleNomBlur} /></FormControl><FormMessage /></FormItem> )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.formState.isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Ajout..." : "Ajouter à la liste"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
