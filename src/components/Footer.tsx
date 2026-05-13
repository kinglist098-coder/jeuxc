import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-cream border-t border-white/10 pt-24 pb-12 mt-auto">
      <div className="container mx-auto px-8 lg:px-20">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20 flex-wrap">
          
          {/* Column 1: Company Info */}
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-display mb-4">APPIOTTI</h3>
            <p className="text-sm text-brand-cream/60 leading-relaxed font-medium">Spécialiste de la vente d'équipements de jeux et loisirs pour sublimer vos moments de détente, basé en Nouvelle-Aquitaine.</p>
            <div className="space-y-4 pt-4 text-sm font-bold text-brand-cream/80">
              <div className="flex items-start gap-4 hover:text-brand-orange transition-colors"><MapPin size={20} className="text-brand-orange mt-0.5 shrink-0" /> 18 Route de Marillac,<br />16220 Saint-Sornin, France</div>
              <div className="flex items-center gap-4 hover:text-brand-orange transition-colors"><Phone size={20} className="text-brand-orange shrink-0" /> 05 45 61 71 81</div>
              <div className="flex items-center gap-4 hover:text-brand-orange transition-colors"><Mail size={20} className="text-brand-orange shrink-0" /> askipas62@gmail.com</div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] border-l-2 border-brand-orange pl-4 mb-2">Shopping</h3>
            <ul className="space-y-5 text-sm font-bold opacity-80">
              <li><Link to="/boutique" className="hover:text-brand-orange hover:translate-x-2 inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Tout le catalogue</Link></li>
              <li><Link to="/boutique?category=baby-foot" className="hover:text-brand-orange hover:translate-x-2 inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Baby-foot</Link></li>
              <li><Link to="/boutique?category=billard" className="hover:text-brand-orange hover:translate-x-2 inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Billards haut de gamme</Link></li>
              <li><Link to="/boutique?category=ping-pong" className="hover:text-brand-orange hover:translate-x-2 inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Tables Ping-Pong</Link></li>
              <li><Link to="/boutique?category=trampoline" className="hover:text-brand-orange hover:translate-x-2 inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Trampolines sécurisés</Link></li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] border-l-2 border-brand-orange pl-4 mb-2">Aide & Support</h3>
            <ul className="space-y-5 text-sm font-bold opacity-80">
              <li><Link to="/securite-virement" className="hover:text-brand-green hover:tracking-widest inline-flex items-center gap-2 transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1"><ShieldCheck size={16} /> Paiement Sécurisé</Link></li>
              <li><Link to="/livraisons-et-retours" className="hover:text-brand-yellow hover:tracking-widest inline-flex items-center gap-2 transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1"><Truck size={16} /> Livraisons & Retours</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange hover:tracking-widest inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Service Client / Contact</Link></li>
              <li><Link to="/a-propos" className="hover:text-brand-orange hover:tracking-widest inline-block transition-all hover:bg-white/5 rounded-lg px-2 -ml-2 py-1">Notre Histoire</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Legitimacy */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] border-l-2 border-brand-orange pl-4 mb-2">Légal</h3>
            <ul className="space-y-5 text-sm font-bold opacity-80">
              <li><Link to="/mentions-legales" className="hover:text-brand-orange inline-block transition-colors border-b border-transparent hover:border-brand-orange">Mentions Légales</Link></li>
              <li><Link to="/cgv" className="hover:text-brand-orange inline-block transition-colors border-b border-transparent hover:border-brand-orange">Conditions de Vente (CGV)</Link></li>
              <li><Link to="/politique-de-confidentialite" className="hover:text-brand-orange inline-block transition-colors border-b border-transparent hover:border-brand-orange">Politique de Confidentialité</Link></li>
              <li><Link to="/politique-de-cookies" className="hover:text-brand-orange inline-block transition-colors border-b border-transparent hover:border-brand-orange">Gestion des Cookies</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Info */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-cream/40 text-center md:text-left">
          <p>© 2016-{currentYear} MONSIEUR HERVÉ APPIOTTI. Tous droits réservés.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 bg-white/5 px-6 py-3 rounded-full">
             <span>SIRET : 820 116 291 00023</span>
             <span className="hidden sm:inline bg-brand-cream/20 w-1 h-1 rounded-full" />
             <span>TVA : FR48820116291</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
