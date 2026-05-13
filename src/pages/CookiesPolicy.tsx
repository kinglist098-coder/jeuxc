import { motion } from "motion/react";
import { Cookie } from "lucide-react";

export default function CookiesPolicy() {
  return (
    <div className="bg-brand-cream min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] p-12 md:p-20 shadow-xl border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-8 text-brand-orange">
            <Cookie size={48} />
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Politique des Cookies</h1>
          </div>
          
          <div className="space-y-8 text-gray-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Que sont les cookies ?</h2>
              <p>Un cookie est un petit fichier texte déposé sur votre ordinateur ou appareil mobile lors de la visite d'un site. Ils nous permettent de faciliter votre navigation, de mémoriser vos préférences et de gérer votre session de panier et de connexion.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Cookies strictement nécessaires</h2>
              <p>Ces cookies sont indispensables au bon fonctionnement du site Appiotti Game Shop. Ils vous permettent d'utiliser les principales fonctionnalités de notre site (par exemple l'utilisation du panier d'achat ou l'accès à votre compte de manière sécurisée).</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Gestion des cookies</h2>
              <p>Vous avez la possibilité de désactiver l'utilisation des cookies en modifiant les paramètres de votre navigateur web. Cependant, vous risquez de ne plus pouvoir passer de commande ou accéder à votre espace client de manière optimale.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
