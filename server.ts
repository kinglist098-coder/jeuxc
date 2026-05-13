import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import serverless from "serverless-http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to ensure items is an array
const ensureArray = (items: any): any[] => {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Data paths (Restored for uploads)
const UPLOADS_DIR = path.join(__dirname, "public", "uploads", "proofs");

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// (Removed local file helpers)

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "askipas62@gmail.com";
const NOTIFY_EMAIL = "zakaz@forumles.ru";

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn("getAuthUser: No authorization header");
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("getAuthUser: No token found in header");
    return null;
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("getAuthUser: Supabase URL or Anon Key is missing in environment variables!");
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("getAuthUser: Supabase error", error);
      return null;
    }
    if (!user) {
      console.warn("getAuthUser: No user returned from Supabase");
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.email === (process.env.VITE_ADMIN_EMAIL || "askipas62@gmail.com"),
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };
  } catch (e) {
    console.error("getAuthUser: unexpected error", e);
    return null;
  }
};

// Start Server Logic
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Multer config for proof uploads (Memory storage to avoid persistent files)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth Sync
  app.patch("/api/auth/me", async (req, res) => {
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const { firstName, lastName } = req.body;

      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          is_admin: authUser.isAdmin
        })
        .select();

      if (error) throw error;
      res.json({ success: true, data });
    } catch (e) {
      console.error("Auth Sync Error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      let query = supabase.from('products').select('*');
      const { category, minPrice, maxPrice, q } = req.query;
      
      if (category) query = query.eq('category', category);
      if (minPrice) query = query.gte('price_ht', Number(minPrice) / 1.2);
      if (maxPrice) query = query.lte('price_ht', Number(maxPrice) / 1.2);
      if (q) query = query.ilike('name', `%${q}%`);

      const { data: products, error } = await query;
      if (error) throw error;
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: "Erreur lors du chargement des produits" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (error || !product) return res.status(404).json({ error: "Produit non trouvé" });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Orders Routes
  app.post("/api/orders", async (req, res) => {
    console.log("POST /api/orders: Request received");
    const user = await getAuthUser(req);
    if (!user) {
      console.warn("POST /api/orders: Auth failed");
      return res.status(401).json({ error: "Non autorisé" });
    }
    
    try {
      const orderId = req.body.id || ("ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase());
      const newOrder = {
        id: orderId,
        user_id: user.id,
        items: req.body.items || [],
        total_ttc: req.body.totalTTC || 0,
        status: "En attente de virement",
        proof_uploaded: false
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;
      
      const mappedOrder = {
        ...data,
        userId: data.user_id,
        items: ensureArray(data.items),
        totalTTC: data.total_ttc,
        proofUploaded: data.proof_uploaded,
        proofUrl: data.proof_url
      };

      console.log("POST /api/orders: Order saved in Supabase", orderId);
      
      // Send confirmation email
      if (resend) {
        console.log("Resend: Attempting to send confirmation email to", NOTIFY_EMAIL);
        try {
          const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [NOTIFY_EMAIL],
            subject: `Confirmation de commande ${orderId}`,
            html: `<h1>Merci pour votre commande ${orderId}</h1><p>Total: ${(newOrder.total_ttc || 0).toFixed(2)}€</p><p>Veuillez effectuer le virement pour valider.</p><p>Note: Envoyé à ${NOTIFY_EMAIL} (Sandbox)</p>`
          });
          if (error) console.error("Resend Confirmation Error:", error);
          else console.log("Resend Confirmation Success:", data);
        } catch (mailErr) {
          console.error("Resend Confirmation Critical Error:", mailErr);
        }

        console.log("Resend: Attempting to notify Admin", NOTIFY_EMAIL);
        try {
          const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [NOTIFY_EMAIL],
            subject: `NOUVELLE COMMANDE - ${orderId}`,
            html: `<h1>Nouvelle commande de ${user.firstName} ${user.lastName}</h1><p>Total: ${(newOrder.total_ttc || 0).toFixed(2)}€</p>`
          });
          if (error) console.error("Resend Admin Notification Error:", error);
          else console.log("Resend Admin Notification Success:", data);
        } catch (adminMailErr) {
          console.error("Resend Admin Notification Critical Error:", adminMailErr);
        }
      }

      res.json(mappedOrder);
    } catch (e: any) {
      console.error("POST /api/orders error:", e);
      res.status(500).json({ error: "Erreur serveur lors de la création de la commande" });
    }
  });

  app.get("/api/orders/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(orders.map((o: any) => ({
        ...o,
        userId: o.user_id,
        items: ensureArray(o.items),
        totalTTC: o.total_ttc,
        proofUploaded: o.proof_uploaded,
        proofUrl: o.proof_url
      })));
    } catch (e: any) {
      res.status(500).json({ error: "Erreur lors du chargement de vos commandes" });
    }
  });

  app.post("/api/orders/:id/proof", upload.single("proof"), async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier téléchargé" });
      }

      // Update order status in Supabase (No file URL stored as per user request)
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          proof_uploaded: true,
          status: "En cours de validation"
        })
        .eq('id', req.params.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !order) return res.status(404).json({ error: "Commande non trouvée" });

      const mappedOrder = {
        ...order,
        userId: order.user_id,
        items: ensureArray(order.items),
        totalTTC: order.total_ttc,
        proofUploaded: order.proof_uploaded,
        proofUrl: null // No URL stored
      };

      // Notify Admin with attachment
      if (resend) {
        console.log("Resend: Attempting to notify Admin of Proof upload (Attachment only)", NOTIFY_EMAIL);
        try {
          const { data, error: mailError } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [NOTIFY_EMAIL],
            subject: `NOUVELLE PREUVE - Commande ${order.id}`,
            html: `
              <div style="font-family: sans-serif; border: 2px solid #FF6B35; padding: 20px; border-radius: 10px;">
                <h1 style="color: #FF6B35;">Alerte Preuve de Virement</h1>
                <p>Client : <strong>${user.firstName} ${user.lastName}</strong> (${user.email})</p>
                <p>Commande : <strong>${order.id}</strong></p>
                <p>Montant : <strong>${order.total_ttc.toFixed(2)}€</strong></p>
                <p>Le fichier est joint à cet email et n'est pas stocké sur le serveur.</p>
              </div>
            `,
            attachments: [
              {
                filename: req.file.originalname,
                content: req.file.buffer.toString('base64')
              }
            ]
          });
          if (mailError) console.error("Resend Proof Notification Error:", mailError);
          else console.log("Resend Proof Notification Success:", data);
        } catch (mailErr) {
          console.error("Resend Proof Notification Critical Error:", mailErr);
        }
      }

      res.json(mappedOrder);
    } catch (e) {
      console.error("Proof upload route error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Debug endpoint (restricted to admin)
  app.get("/api/debug/server", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    res.json({
      env: {
        hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        hasResendKey: !!process.env.RESEND_API_KEY,
        adminEmail: ADMIN_EMAIL,
        nodeEnv: process.env.NODE_ENV
      },
      user
    });
  });

  // Admin Routes
  app.get("/api/admin/orders", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(orders.map((o: any) => ({
        ...o,
        userId: o.user_id,
        items: ensureArray(o.items),
        totalTTC: o.total_ttc,
        proofUploaded: o.proof_uploaded,
        proofUrl: o.proof_url
      })));
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { status } = req.body;
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();
        
      if (error || !order) return res.status(404).json({ error: "Commande non trouvée" });

      const mappedOrder = {
        ...order,
        userId: order.user_id,
        items: ensureArray(order.items),
        totalTTC: order.total_ttc,
        proofUploaded: order.proof_uploaded,
        proofUrl: order.proof_url
      };

      // Send status update email to user
      if (resend) {
        const { data: orderUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', order.user_id)
          .single();
        
        if (orderUser) {
          console.log("Resend: Attempting status update email to", NOTIFY_EMAIL);
          try {
            const { data, error } = await resend.emails.send({
              from: "onboarding@resend.dev",
              to: [NOTIFY_EMAIL],
              subject: `Mise à jour de votre commande ${order.id}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #FF6B35;">Le statut de votre commande a changé (Simulation pour Sandbox)</h2>
                  <p>Bonjour ${orderUser.first_name},</p>
                  <p>Votre commande <strong>${order.id}</strong> est désormais : <strong style="color: #FF6B35; text-transform: uppercase;">${status}</strong></p>
                  ${status === "Expédiée" ? `<p>Votre colis est en route ! Bonne réception.</p>` : ''}
                  ${status === "Validée" ? `<p>Votre virement a été confirmé. Nous préparons votre colis.</p>` : ''}
                  <p>Retrouvez tous les détails dans votre espace client.</p>
                  <p>L'équipe Appiotti Game Shop</p>
                  <hr/>
                  <p style="font-size: 0.8em; color: #666;">Note: Cet email a été envoyé à l'admin (${NOTIFY_EMAIL}) car Resend est en mode Sandbox.</p>
                </div>
              `
            });
            if (error) console.error("Resend Status Update Error:", error);
            else console.log("Resend Status Update Success:", data);
          } catch (mailErr) {
            console.error("Resend Status Update Critical Error:", mailErr);
          }
        }
      }

      res.json(mappedOrder);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id');
      
      if (error) throw error;
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !product) return res.status(404).json({ error: "Produit non trouvé" });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Reviews Routes
  app.get("/api/reviews", async (req, res) => {
    try {
      let query = supabase.from('reviews').select('*');
      const { productId } = req.query;
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data: reviews, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      res.json(reviews.map((r: any) => ({
        ...r,
        productId: r.product_id,
        userName: r.user_name,
        userEmail: r.user_email
      })));
    } catch (e) {
      res.status(500).json({ error: "Erreur lors du chargement des avis" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });

    try {
      const { rating, comment, userName, productId } = req.body;
      const newReview = {
        product_id: productId || null,
        user_id: user.id,
        user_name: userName || `${user.firstName} ${user.lastName}`,
        user_email: user.email,
        rating,
        comment
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Erreur lors de l'ajout de l'avis" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export for Netlify Functions
export const handler = serverless(app);

// Start server if run directly
if (process.env.NODE_ENV !== "production" || !process.env.NETLIFY) {
  startServer().catch(console.error);
}

export { app, startServer };
