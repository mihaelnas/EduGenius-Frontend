import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, UserCog, Users, Zap, BookCheck, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { placeholderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <UserCog className="h-10 w-10 text-primary" />,
    title: 'Pouvoir Administratif',
    description: 'Gérez sans effort les utilisateurs, les classes et les matières. Maintenez l\'intégrité de la plateforme avec de puissants outils d\'administration.',
  },
  {
    icon: <GraduationCap className="h-10 w-10 text-primary" />,
    title: 'Espace Enseignant',
    description: 'Créez du contenu de cours engageant, gérez vos classes, consultez les listes d\'élèves et organisez votre emploi du temps.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Portail Étudiant',
    description: 'Accédez à vos supports de cours, voyez vos camarades de classe et suivez votre parcours d\'apprentissage avec un tableau de bord simple.',
  },
];

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'homepage-hero');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/register">S'inscrire</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="container mx-auto px-4 text-center md:px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                L'éducation réinventée pour le futur
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/80 max-w-2xl mx-auto">
                EduGenius est la plateforme tout-en-un conçue pour simplifier l'apprentissage, l'enseignement et la gestion administrative.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" asChild>
                  <Link href="/register">Commencez Gratuitement</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">En Savoir Plus</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-20 md:py-28 bg-card/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                  Une plateforme conçue pour chaque rôle
                </h2>
                <p className="mt-4 text-lg text-foreground/70">
                  EduGenius offre une expérience unique et adaptée, que vous soyez administrateur, enseignant ou étudiant.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center text-center shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2">
                  <CardHeader className="items-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} EduGenius. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Politique de Confidentialité</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Conditions d'Utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
