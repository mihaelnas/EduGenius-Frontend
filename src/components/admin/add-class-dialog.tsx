'use client';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Le nom de la classe est requis.' }),
  niveau: z.enum(['L1', 'L2', 'L3', 'M1', 'M2']),
  filiere: z.enum(['IG', 'GB', 'ASR', 'GID', 'OCC']),
  anneeScolaire: z.string().regex(/^\d{4}-\d{4}$/, { message: "Format attendu: AAAA-AAAA" }),
});

export function AddClassDialog() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      anneeScolaire: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Classe ajoutée',
      description: `La classe ${values.name} a été créée avec succès.`,
    });
    // Here you would typically close the dialog and refresh the data
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une classe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle classe</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle classe.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la classe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Licence 3 - IG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="niveau"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {['L1', 'L2', 'L3', 'M1', 'M2'].map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="filiere"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Filière</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une filière" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {['IG', 'GB', 'ASR', 'GID', 'OCC'].map(filiere => (
                            <SelectItem key={filiere} value={filiere}>{filiere}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="anneeScolaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année Scolaire</FormLabel>
                  <FormControl>
                    <Input placeholder="2023-2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Créer la classe</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
