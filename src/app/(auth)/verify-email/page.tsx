
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { applyActionCode } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const auth = useAuth();
    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const oobCode = searchParams.get('oobCode');

        if (oobCode) {
            applyActionCode(auth, oobCode)
                .then(() => {
                    setStatus('success');
                })
                .catch((error) => {
                    console.error("Verification Error:", error);
                    setError(error.message);
                    setStatus('error');
                });
        } else {
             setStatus('error');
             setError("Code de vérification manquant ou invalide.");
        }
    }, [searchParams, auth]);


    const renderContent = () => {
        switch(status) {
            case 'loading':
                return <CardDescription>Vérification de votre e-mail en cours...</CardDescription>;
            case 'error':
                 return (
                    <>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            Oops ! Une erreur est survenue.
                        </CardTitle>
                        <CardDescription>{error || "Impossible de vérifier votre e-mail. Le lien est peut-être expiré ou invalide."}</CardDescription>
                    </>
                );
            case 'success':
                 return (
                    <>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                           <CheckCircle /> E-mail vérifié avec succès !
                        </CardTitle>
                        <CardDescription>
                            Merci d'avoir vérifié votre adresse e-mail. Votre compte est maintenant en attente de validation par un administrateur. Vous recevrez une notification une fois votre compte activé.
                        </CardDescription>
                    </>
                )
        }
    }

    return (
        <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="text-center space-y-4">
               {renderContent()}
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button asChild>
                    <Link href="/login">Retour à la page de connexion</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
