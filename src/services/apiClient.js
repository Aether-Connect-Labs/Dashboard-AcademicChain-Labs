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
    (response) => {
      // ADAPTADOR DE RESPUESTA N8N
      // Si n8n devuelve la estructura interna [{ json: ... }], la desempaquetamos
      if (Array.isArray(response.data) && response.data.length === 1 && response.data[0].json) {
        // Caso 1: El contenido real está en .json
        const content = response.data[0].json;
        // Si el contenido es un array (ej. lista de instituciones), lo devolvemos
        // Si es un objeto (ej. dashboard stats), lo devolvemos
        response.data = content;
      }
      return response;
    },
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

