
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Course } from '@/lib/placeholder-data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const resourceSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['pdf', 'video', 'link']),
  title: z.string().min(1, 'Le titre est requis.'),
  url: z.string().optional(),
  file: z.any().optional(),
}).refine(data => {
  if (data.type === 'link' || data.type === 'video') {
    return !!data.url && data.url.length > 0;
  }
  if (data.type === 'pdf') {
    return !!data.file && data.file.length > 0;
  }
  return false;
}, {
  message: 'Un fichier ou une URL est requis(e).',
  path: ['url'], // path to show error under
});


const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  content: z.string().min(1, 'Le contenu est requis.'),
  resources: z.array(resourceSchema),
});

type AddCourseDialogProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    subjectId: string;
    onCourseAdded: (newCourse: Course) => void;
}

export function AddCourseDialog({ isOpen, setIsOpen, subjectId, onCourseAdded }: AddCourseDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      resources: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resources"
  });
  
  const watchedResources = form.watch('resources');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      subjectId: subjectId,
      createdAt: new Date().toISOString(),
      title: values.title,
      content: values.content,
      resources: values.resources.map(r => ({ 
          id: `res_${Date.now()}_${Math.random()}`,
          type: r.type,
          title: r.title,
          // In a real app, you'd upload the file and get a URL.
          // For demo, we'll just store the file name or the url.
          url: r.type === 'pdf' ? (r.file?.[0]?.name || '') : (r.url || ''),
      }))
    };
    onCourseAdded(newCourse);
    toast({
      title: 'Cours ajouté',
      description: `Le cours "${values.title}" a été créé avec succès.`,
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) form.reset();
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau cours</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer un nouveau cours.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Titre du cours</FormLabel><FormControl><Input placeholder="Ex: Introduction à l'Algèbre" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="content" render={({ field }) => ( <FormItem><FormLabel>Contenu / Description</FormLabel><FormControl><Textarea placeholder="Décrivez le contenu de ce cours..." {...field} /></FormControl><FormMessage /></FormItem> )} />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Ressources</h4>
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const resourceType = watchedResources[index]?.type;
                  return (
                    <div key={field.id} className="flex gap-2 items-end p-3 border rounded-md">
                      <FormField control={form.control} name={`resources.${index}.type`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="video">Vidéo</SelectItem><SelectItem value="link">Lien</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name={`resources.${index}.title`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Titre de la ressource" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      
                        <FormItem className="flex-1">
                          <FormLabel>{resourceType === 'link' || resourceType === 'video' ? 'URL' : 'Fichier'}</FormLabel>
                          {resourceType === 'link' || resourceType === 'video' ? (
                            <FormField
                              control={form.control}
                              name={`resources.${index}.url`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input placeholder="https://..." {...field} value={field.value || ''} />
                                </FormControl>
                              )}
                            />
                          ) : (
                             <FormField
                              control={form.control}
                              name={`resources.${index}.file`}
                              render={() => (
                                <FormControl>
                                  <Input
                                    type="file"
                                    {...form.register(`resources.${index}.file`)}
                                  />
                                </FormControl>
                              )}
                            />
                          )}
                           <FormMessage>{form.formState.errors.resources?.[index]?.url?.message}</FormMessage>
                        </FormItem>
                      
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ type: 'link', title: '', url: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une ressource
                </Button>
              </div>
            </div>

            <DialogFooter className='pt-4'>
               <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit">Créer le cours</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
