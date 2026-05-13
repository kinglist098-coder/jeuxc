import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, UserPlus, LogIn, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff, KeyRound, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

type AuthView = "login" | "signup" | "verify_signup_otp" | "forgot_password" | "reset_password_otp";

export default function Auth({ mode: initialMode }: { mode: "login" | "signup" }) {
  const [view, setView] = useState<AuthView>(initialMode);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      addToast(`Heureux de vous revoir !`, "success");
      const isAdmin = data.user.email === "askipas62@gmail.com";
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(isAdmin ? "/admin/dashboard" : "/client/dashboard");
      }
    } catch (err: any) {
      addToast(err.message || "Erreur de connexion", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName }
        }
      });
      
      if (error) throw error;
      
      addToast("Code de confirmation envoyé ! Vérifiez vos emails.", "success");
      setView("verify_signup_otp");

    } catch (err: any) {
      addToast(err.message || "Erreur d'inscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });

      if (error) throw error;

      // Sync with local backend for consistency in orders/reviews
      if (data.session?.access_token) {
        try {
          await fetch("/api/auth/me", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({ firstName, lastName })
          });
        } catch (syncErr) {
          console.error("Erreur de synchronisation backend:", syncErr);
          // On ne bloque pas l'utilisateur si la synchro échoue mais on le log
        }
      }

      addToast("Compte vérifié avec succès. Bienvenue !", "success");
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate("/boutique");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      addToast(err.message || "Code invalide ou expiré", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      addToast("Code de réinitialisation envoyé par email.", "success");
      setView("reset_password_otp");
    } catch (err: any) {
      addToast(err.message || "Erreur lors de l'envoi du code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Étape 1 : Vérifier le code et authentifier l'utilisateur
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery'
      });
      if (error) throw error;

      // Étape 2 : Mettre à jour le mot de passe
      const updateRes = await supabase.auth.updateUser({ password: newPassword });
      if (updateRes.error) throw updateRes.error;

      addToast("Mot de passe mis à jour avec succès !", "success");
      
      // On redirige au bon endroit si login
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(data.user?.email === "askipas62@gmail.com" ? "/admin/dashboard" : "/client/dashboard");
      }

    } catch (err: any) {
      addToast(err.message || "Code invalide ou erreur de mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Form Selector
  const renderForm = () => {
    switch (view) {
      case "login":
        return (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mot de passe</label>
                <button type="button" onClick={() => setView("forgot_password")} className="text-xs font-bold text-[#FF6B35] hover:underline">Mot de passe oublié ?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-14 py-4 transition-all outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <LogIn />} Se connecter
            </button>
          </form>
        );

      case "signup":
        return (
          <form onSubmit={handleSignupRequest} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Prénom</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nom</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-14 py-4 transition-all outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <UserPlus />} Créer mon compte
            </button>
          </form>
        );

      case "verify_signup_otp":
        return (
          <form onSubmit={handleVerifySignupOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Code de confirmation à 6 chiffres</label>
              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold tracking-[0.5em]"
                />
              </div>
              <p className="text-xs text-gray-400 px-4">Entrez le code reçu à l'adresse <b>{email}</b></p>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Confirmer
            </button>
          </form>
        );

      case "forgot_password":
        return (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Email associé au compte</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                />
              </div>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />} Recevoir mon code
            </button>
          </form>
        );

      case "reset_password_otp":
        return (
          <form onSubmit={handleResetPasswordOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Code de réinitialisation</label>
              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold tracking-[0.5em]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-14 py-4 transition-all outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Lock />} Changer mon mot de passe
            </button>
          </form>
        );
    }
  };

  const getTitles = () => {
    switch(view) {
      case "login": return { title: "Bon retour !", subtitle: "Heureux de vous revoir parmi nous." };
      case "signup": return { title: "Créez votre univers", subtitle: "Rejoignez la communauté des passionnés de loisirs." };
      case "verify_signup_otp": return { title: "Vérifiez votre email", subtitle: "Un code à 6 chiffres a été envoyé pour confirmer votre adresse." };
      case "forgot_password": return { title: "Mot de passe oublié", subtitle: "Entrez votre email pour recevoir un code de réinitialisation." };
      case "reset_password_otp": return { title: "Nouveau mot de passe", subtitle: "Entrez le code reçu et définissez un nouveau sésame." };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100"
      >
        <div className="p-12 md:p-16">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg">A</div>
              <span className="text-2xl font-black font-display text-brand-dark uppercase tracking-tight">Appiotti <span className="text-brand-orange">Game Shop</span></span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">
              {title}
            </h1>
            <p className="text-gray-500 font-medium">
              {subtitle}
            </p>
          </div>

          {renderForm()}

          <div className="mt-12 text-center flex flex-col gap-4">
            {view === "login" || view === "signup" ? (
             <p className="text-gray-400 font-bold">
               {view === "login" ? "Pas encore de compte ?" : "Déjà membre ?"} 
               <button 
                type="button"
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-[#FF6B35] ml-2 hover:underline inline-block"
               >
                 {view === "login" ? "Inscrivez-vous" : "Connectez-vous"}
               </button>
             </p>
            ) : (
             <p className="text-gray-400 font-bold">
               Retourner à la 
               <button 
                type="button"
                onClick={() => setView("login")}
                className="text-[#FF6B35] ml-2 hover:underline inline-block"
               >
                 page de connexion
               </button>
             </p>
            )}
             <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-8 border-t border-gray-50">
                <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
