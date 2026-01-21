#!/bin/bash

# Script de Despliegue Asistido - Fun Facts
# Este script te guiará paso a paso en el proceso de despliegue

echo "🎯 Asistente de Despliegue - Fun Facts"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script te ayudará a desplegar Fun Facts en producción.${NC}"
echo ""
echo "Necesitarás:"
echo "  ✓ Cuenta en MongoDB Atlas (gratuita)"
echo "  ✓ Cuenta en Render (gratuita)"
echo "  ✓ Cuenta en Netlify (gratuita)"
echo "  ✓ Repositorio Git (GitHub, GitLab, etc.)"
echo ""

# Paso 1: MongoDB Atlas
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 1: MongoDB Atlas${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Abre en tu navegador: https://www.mongodb.com/cloud/atlas/register"
echo "2. Crea una cuenta (o inicia sesión)"
echo "3. Crea un cluster GRATUITO (M0)"
echo "4. Configura usuario de base de datos"
echo "5. Agrega 0.0.0.0/0 en Network Access"
echo "6. Obtén el connection string"
echo ""
read -p "¿Ya tienes el connection string de MongoDB? (s/n): " mongodb_ready

if [ "$mongodb_ready" != "s" ]; then
    echo ""
    echo -e "${RED}📋 Por favor completa la configuración de MongoDB Atlas primero.${NC}"
    echo "Cuando tengas el connection string, vuelve a ejecutar este script."
    exit 0
fi

echo ""
read -p "Pega tu connection string de MongoDB: " mongodb_uri

if [ -z "$mongodb_uri" ]; then
    echo -e "${RED}❌ No ingresaste un connection string válido${NC}"
    exit 1
fi

# Validar que tenga el formato correcto
if [[ ! "$mongodb_uri" =~ ^mongodb.*://.*$ ]]; then
    echo -e "${RED}❌ El connection string no parece válido${NC}"
    echo "Debe comenzar con mongodb:// o mongodb+srv://"
    exit 1
fi

# Asegurarse de que tenga el nombre de la base de datos
if [[ ! "$mongodb_uri" =~ /funfacts ]]; then
    echo -e "${YELLOW}⚠️  Agregando /funfacts al connection string${NC}"
    # Agregar /funfacts antes de los parámetros si no existe
    mongodb_uri="${mongodb_uri/\?/\/funfacts?}"
fi

echo -e "${GREEN}✓ Connection string guardado${NC}"

# Paso 2: Git Repository
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 2: Preparar Repositorio Git${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "¿Ya tienes un repositorio Git remoto? (s/n): " has_repo

if [ "$has_repo" != "s" ]; then
    echo ""
    echo "Crea un repositorio en:"
    echo "  - GitHub: https://github.com/new"
    echo "  - GitLab: https://gitlab.com/projects/new"
    echo ""
    read -p "URL de tu repositorio (ej: https://github.com/usuario/funfacts.git): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        echo ""
        echo "Inicializando git y subiendo código..."
        
        if [ ! -d .git ]; then
            git init
        fi
        
        git add .
        git commit -m "Initial commit - Fun Facts" 2>/dev/null || echo "Ya hay commits"
        git branch -M main 2>/dev/null || true
        git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
        
        echo ""
        echo "Subiendo a GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Código subido exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al subir el código${NC}"
            echo "Intenta manualmente: git push -u origin main"
        fi
    fi
fi

# Paso 3: Render (Backend)
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 3: Desplegar Backend en Render${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Abre: https://dashboard.render.com/"
echo "2. Click en 'New +' → 'Web Service'"
echo "3. Conecta tu repositorio"
echo "4. Configuración:"
echo "   - Name: funfacts-backend"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Instance Type: Free"
echo ""
echo "5. Variables de Entorno (muy importante):"
echo "   NODE_ENV = production"
echo "   PORT = 3001"
echo "   MONGODB_URI = ${mongodb_uri}"
echo "   CORS_ORIGIN = * (cambiaremos esto después)"
echo ""
echo "6. Click en 'Create Web Service'"
echo "7. Espera 5-10 minutos"
echo ""
read -p "¿Ya desplegaste el backend en Render? (s/n): " backend_ready

if [ "$backend_ready" != "s" ]; then
    echo ""
    echo -e "${YELLOW}⏸️  Pausa aquí.${NC}"
    echo "Cuando termines de desplegar en Render, vuelve a ejecutar este script."
    echo ""
    echo "Tu connection string de MongoDB (guárdalo):"
    echo "$mongodb_uri"
    exit 0
fi

read -p "URL de tu backend en Render (ej: https://funfacts-backend-xxxx.onrender.com): " backend_url

if [ -z "$backend_url" ]; then
    echo -e "${RED}❌ No ingresaste una URL válida${NC}"
    exit 1
fi

# Remover barra final si existe
backend_url="${backend_url%/}"

echo ""
echo "Probando conexión con el backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$backend_url/health" 2>/dev/null)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Backend funcionando correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo verificar el backend (código: $response)${NC}"
    echo "Esto es normal si el backend está 'dormido' (plan gratuito)"
    echo "Espera 30 segundos y verifica manualmente: $backend_url/health"
fi

# Actualizar .env.production del frontend
echo ""
echo "Actualizando configuración del frontend..."
cat > frontend/.env.production << EOF
VITE_API_URL=$backend_url
VITE_WS_URL=$backend_url
EOF

echo -e "${GREEN}✓ frontend/.env.production actualizado${NC}"

# Paso 4: Netlify (Frontend)
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 4: Desplegar Frontend en Netlify${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Abre: https://app.netlify.com/"
echo "2. Click en 'Add new site' → 'Import an existing project'"
echo "3. Conecta tu repositorio"
echo "4. Configuración:"
echo "   - Base directory: frontend"
echo "   - Build command: npm run build"
echo "   - Publish directory: frontend/dist"
echo ""
echo "5. Variables de Entorno:"
echo "   VITE_API_URL = $backend_url"
echo "   VITE_WS_URL = $backend_url"
echo ""
echo "6. Click en 'Deploy site'"
echo "7. Espera 2-3 minutos"
echo "8. Opcional: Personaliza el nombre del sitio"
echo ""
read -p "¿Ya desplegaste el frontend en Netlify? (s/n): " frontend_ready

if [ "$frontend_ready" != "s" ]; then
    echo ""
    echo -e "${YELLOW}⏸️  Pausa aquí.${NC}"
    echo "Cuando termines de desplegar en Netlify, continúa."
    echo ""
    echo "Recuerda configurar las variables de entorno:"
    echo "  VITE_API_URL = $backend_url"
    echo "  VITE_WS_URL = $backend_url"
    exit 0
fi

read -p "URL de tu sitio en Netlify (ej: https://funfacts-game.netlify.app): " frontend_url

if [ -z "$frontend_url" ]; then
    echo -e "${RED}❌ No ingresaste una URL válida${NC}"
    exit 1
fi

# Remover barra final si existe
frontend_url="${frontend_url%/}"

# Paso 5: Actualizar CORS
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 5: Actualizar CORS en Backend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "IMPORTANTE: Actualiza la variable CORS_ORIGIN en Render"
echo ""
echo "1. Ve a: https://dashboard.render.com/"
echo "2. Selecciona tu servicio 'funfacts-backend'"
echo "3. Ve a la pestaña 'Environment'"
echo "4. Edita CORS_ORIGIN:"
echo "   Valor actual: *"
echo "   Nuevo valor: $frontend_url"
echo "5. Guarda (Render redesplegará automáticamente)"
echo ""
read -p "¿Ya actualizaste CORS_ORIGIN? (s/n): " cors_updated

# Commit cambios
echo ""
echo "Guardando cambios..."
git add frontend/.env.production 2>/dev/null
git commit -m "Update production environment variables" 2>/dev/null || echo "Sin cambios para commitear"

# Resumen Final
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ¡DESPLIEGUE COMPLETADO!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Resumen de tu despliegue:"
echo ""
echo -e "${BLUE}MongoDB Atlas:${NC}"
echo "  Connection: ${mongodb_uri:0:40}..."
echo ""
echo -e "${BLUE}Backend (Render):${NC}"
echo "  URL: $backend_url"
echo "  Health: $backend_url/health"
echo ""
echo -e "${BLUE}Frontend (Netlify):${NC}"
echo "  URL: $frontend_url"
echo ""
echo -e "${GREEN}🎮 Tu juego está LISTO!${NC}"
echo ""
echo "Pruébalo:"
echo "  1. Abre: $frontend_url"
echo "  2. Crea una sala"
echo "  3. Comparte el código con amigos"
echo "  4. ¡Juega!"
echo ""
echo -e "${YELLOW}⚠️  Nota:${NC} El backend puede tardar ~30 segundos en despertar"
echo "la primera vez (plan gratuito de Render)"
echo ""
echo "📚 Documentación:"
echo "  - README.md: Información general"
echo "  - DEPLOYMENT.md: Detalles de despliegue"
echo "  - EXAMPLES.md: Ejemplos de uso"
echo ""
echo -e "${GREEN}¡Que disfrutes tu juego!${NC} 🎉"
