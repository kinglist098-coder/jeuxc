import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-brand-cream min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] p-12 md:p-20 shadow-xl border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-8 text-brand-orange">
            <ShieldCheck size={48} />
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Politique de Confidentialité</h1>
          </div>
          
          <div className="space-y-8 text-gray-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">1. Collecte des données</h2>
              <p>Dans le cadre de l'utilisation de nos services, Appiotti Game Shop est amené à collecter des données personnelles (nom, prénom, adresse email, adresse de facturation et de livraison) nécessaires au traitement de vos commandes.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">2. Utilisation des données</h2>
              <p>Vos données sont utilisées exclusivement pour :</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Traiter et expédier vos commandes</li>
                <li>Gérer la relation client et le support après-vente</li>
                <li>Vous envoyer notre newsletter (uniquement si vous y êtes abonné)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">3. Protection et Stockage</h2>
              <p>Nous appliquons toutes les mesures de sécurité nécessaires pour protéger vos informations. Vos données sont conservées sur des serveurs sécurisés et ne sont en aucun cas vendues ou cédées à des tiers à des fins commerciales.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">4. Vos droits (RGPD)</h2>
              <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. Pour exercer ce droit, contactez-nous à l'adresse email : <strong>askipas62@gmail.com</strong>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
