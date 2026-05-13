const API_URL = "";

export interface Order {
  id: string;
  userId: string;
  items: any[];
  totalTTC: number;
  status: string;
  createdAt: string;
  proofUploaded: boolean;
  proofUrl?: string;
}

export const orderService = {
  async create(orderData: { items: any[]; totalTTC: number; status?: string; id?: string }) {
    const token = localStorage.getItem("token");
    console.log(`Fetching: ${API_URL}/api/orders`, { method: "POST" });
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      let errorMessage = "Erreur lors de la création de la commande";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si ce n'est pas du JSON, c'est probablement une erreur 404/500 HTML (ex: Netlify redirect)
        if (res.status === 401) errorMessage = "Session expirée ou non autorisée. Veuillez vous reconnecter.";
        else if (res.status === 404) errorMessage = "Service de commande indisponible (404).";
        else errorMessage = `Erreur serveur (${res.status}).`;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  async getMyOrders() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/orders/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des commandes");
    return res.json();
  },

  async uploadProof(orderId: string, file: File) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("proof", file);

    const res = await fetch(`${API_URL}/api/orders/${orderId}/proof`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) throw new Error("Erreur lors de l'envoi de la preuve");
    return res.json();
  },

  async getAllForAdmin() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/orders`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des commandes admin");
    return res.json();
  },

  async updateStatus(id: string, status: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
    return res.json();
  }
};
