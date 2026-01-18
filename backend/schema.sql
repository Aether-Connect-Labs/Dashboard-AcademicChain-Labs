-- 1. Tabla de Instituciones 
CREATE TABLE instituciones ( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    nombre VARCHAR(255) NOT NULL, 
    slug VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'hospital-central' 
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido 
    created_at TIMESTAMP DEFAULT NOW() 
); 

-- 2. Tabla de API Keys 
CREATE TABLE api_keys ( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    institucion_id UUID REFERENCES instituciones(id) ON DELETE CASCADE, 
    nombre_llave VARCHAR(100), -- Ej: "Acceso Web Terminal" 
    key_prefix VARCHAR(10),    -- Ej: "inst_" para identificar rápido 
    key_hash TEXT NOT NULL,    -- La llave cifrada 
    role VARCHAR(50) DEFAULT 'institution_admin', -- Added based on frontend needs
    estado BOOLEAN DEFAULT true, 
    ultima_sesion TIMESTAMP, 
    expires_at TIMESTAMP 
);