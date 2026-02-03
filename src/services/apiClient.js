import axios from "axios";
import { toast } from "../utils/toast.js";

export function createApiClient({ baseUrl, apiKey }) {
  const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true, // IMPORTANT: Enviar cookies en requests cross-origin
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey || "",
    },
  });

  instance.interceptors.request.use((config) => {
    // DETECCIÓN AUTOMÁTICA DE N8N
    // Si la URL base parece un Webhook de n8n, activamos el "Modo Adaptador"
    // Esto permite que n8n reciba la ruta como un parámetro, ya que n8n ignora los subdirectorios por defecto.
    const isN8n = config.baseURL?.includes("/webhook/") || config.baseURL?.includes("/webhook-test/");

    if (isN8n && config.url) {
      // Guardamos la ruta original (ej: /dashboard/overview)
      const originalRoute = config.url;
      
      // Reseteamos la URL para que la petición vaya a la raíz del Webhook
      config.url = "";

      // Pasamos la ruta como parámetro para que n8n sepa qué hacer
      if (config.method === "get" || config.method === "delete") {
        config.params = { ...config.params, route: originalRoute };
      } else {
        // Para POST/PUT, lo enviamos en el cuerpo
        config.data = { ...config.data, route: originalRoute };
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Error inesperado en la API";
        toast.error(message);
      } else {
        toast.error("No se pudo conectar con el backend");
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

