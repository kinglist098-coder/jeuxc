import { motion } from "motion/react";
import { Truck } from "lucide-react";

export default function DeliveryReturns() {
  return (
    <div className="bg-brand-cream min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] p-12 md:p-20 shadow-xl border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-8 text-brand-orange">
            <Truck size={48} />
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Livraisons & Retours</h1>
          </div>
          
          <div className="space-y-8 text-gray-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Quels sont nos délais d'expédition ?</h2>
              <p>Toute commande passée sur Appiotti Game Shop est expédiée dans les 48 heures ouvrées suivant la validation (et réception) du virement bancaire. Les week-ends et jours fériés peuvent rallonger ce délai.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Combien coûtent les frais de livraison ?</h2>
              <p>Nous offrons la livraison standard pour toute commande supérieure à 100€ en France Métropolitaine. Pour les commandes inférieures à ce montant, les frais de port sont calculés à l'étape du panier selon la nature (et le volume) des équipements commandés.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Puis-je retourner mon article ?</h2>
              <p>Oui. Conformément à la législation en vigueur, vous disposez de 14 jours de rétractation après la réception du matériel pour nous le retourner s'il ne vous convient pas, à condition que le produit ne soit pas utilisé ni abîmé, et retourné dans son emballage d'origine.</p>
              <p className="mt-2">L'adresse de retour est basée en France (Charente, 16220). Les frais de retour restent à votre charge sauf en cas d'erreur avérée de notre part lors de l'expédition.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
