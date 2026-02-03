# Guía de Integración con n8n

Para conectar este Dashboard a n8n, hemos configurado un **Adaptador Automático**.
No necesitas cambiar el código del frontend. Solo debes configurar tu Webhook de n8n correctamente.

## 1. Configuración del Webhook en n8n

1. Crea un nodo **Webhook** en n8n.
2. Configúralo con:
   - **HTTP Method**: `GET` y `POST` (o usa dos nodos, uno para cada método).
   - **Path**: `/` (La raíz del webhook).
   - **Response Mode**: `On Received` (Para que el frontend espere tu respuesta JSON).
   - **Authentication**: `None` (o valida el header `X-API-Key` manualmente en tu flujo).
   - **CORS**: Asegúrate de permitir el dominio de Vercel en las opciones del Webhook (Enable CORS).

## 2. Cómo funciona el enrutamiento

El Dashboard enviará todas las peticiones a tu URL de Webhook única (ej. `https://n8n.tu-servidor.com/webhook/mi-uuid`).
Para que sepas qué página está pidiendo datos, el Dashboard añade automáticamente un parámetro `route`:

- **GET Requests**: Recibirás `route` en los Query Parameters (ej. `?route=/dashboard/overview`).
- **POST Requests**: Recibirás `route` en el Body JSON (ej. `{ "route": "/partner/institutions", ... }`).

Debes usar un nodo **Switch** o **If** en n8n para filtrar por `route` y devolver los datos correctos.

---

## 3. Esquemas de Datos Requeridos (JSON)

Tu flujo debe devolver JSON con estas estructuras exactas para que el Dashboard funcione.

### A. Dashboard Home
**Ruta:** `/dashboard/overview` (GET)
**Respuesta:**
```json
{
  "totalEmissions": 1250,
  "activeInstitutions": 12,
  "revokedCredentials": 5,
  "recentActivity": [
    { "id": 1, "action": "Emisión", "details": "Credencial #123", "time": "2h ago" },
    { "id": 2, "action": "Verificación", "details": "Credencial #456", "time": "5h ago" }
  ]
}
```

### B. Instituciones
**Ruta:** `/partner/institutions` (GET)
**Respuesta:** `Array` de objetos.
```json
[
  {
    "id": "inst-1",
    "name": "Universidad Nacional",
    "status": "active",
    "credits": 500,
    "email": "contacto@una.edu",
    "joinedAt": "2023-01-15",
    "emissions": 150,
    "verifications": 45,
    "revocations": 2
  }
]
```

### C. Billetera (Wallet)
**Ruta:** `/dashboard/wallet` (GET)
**Respuesta:**
```json
{
  "balance": 12500.45,
  "transactions": [
    {
      "id": "tx-1",
      "type": "credit", 
      "amount": 5000,
      "date": "2023-10-24T09:15:00Z",
      "label": "Fondeo Inicial",
      "txId": "0.0.12345@169820"
    },
    {
      "id": "tx-2",
      "type": "debit",
      "amount": 50,
      "date": "2023-10-25T14:30:00Z",
      "label": "Recarga Gas",
      "txId": "0.0.34567@169824"
    }
  ]
}
```

### D. Historial Cripto (Página Nueva)
**Ruta:** `/partner/crypto/transactions` (GET)
**Respuesta:** `Array` de transacciones (misma estructura que transactions de wallet).
```json
[
  {
    "id": "tx-1",
    "description": "Pago mensual",
    "type": "deposit",
    "amount": 100,
    "transactionId": "0.0.12345",
    "timestamp": "2023-11-01T10:00:00Z"
  }
]
```

### E. Credenciales por Institución
**Ruta:** `/partner/institutions/:id/credentials` (GET)
**Nota:** El `:id` vendrá dentro del string de la ruta, ej: `/partner/institutions/inst-1/credentials`.
**Respuesta:**
```json
[
  {
    "id": "cred-1",
    "studentName": "Juan Pérez",
    "studentId": "A001",
    "program": "Ingeniería",
    "status": "verified",
    "issuedAt": "2023-01-15T10:00:00Z"
  }
]
```
