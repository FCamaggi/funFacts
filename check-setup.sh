#!/bin/bash

# Script de verificación del proyecto Fun Facts
# Verifica que todo esté correctamente configurado

echo "🎯 Verificando Proyecto Fun Facts..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
    else
        echo -e "${RED}✗${NC} $1 no encontrado"
        ((ERRORS++))
    fi
}

# Función para verificar directorios
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
    else
        echo -e "${RED}✗${NC} $1 no encontrado"
        ((ERRORS++))
    fi
}

echo "📁 Verificando estructura de carpetas..."
check_dir "backend"
check_dir "frontend"
check_dir "cards"
check_dir "docs"
check_dir "backend/models"
check_dir "backend/utils"
check_dir "frontend/src/components"
check_dir "frontend/src/services"
echo ""

echo "📄 Verificando archivos principales..."
check_file "backend/server.js"
check_file "backend/package.json"
check_file "backend/.env"
check_file "frontend/src/App.jsx"
check_file "frontend/package.json"
check_file "frontend/.env"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "DEPLOYMENT.md"
echo ""

echo "🎴 Verificando archivos de cartas..."
check_file "cards/01_habitos_cotidianos.json"
check_file "cards/02_escala_de_gustos_0_100.json"
check_file "cards/03_experiencias_y_viajes.json"
check_file "cards/04_autoevaluacion_personalidad_0_100.json"
check_file "cards/05_conocimientos_y_habilidades.json"
check_file "cards/06_vida_digital_y_tecnologia.json"
check_file "cards/07_relaciones_y_entorno_social.json"
check_file "cards/08_hipoteticos_y_fantasia.json"
check_file "cards/09_secretos_y_picardia_adultos.json"
check_file "cards/10_intimidad_y_pareja_adultos.json"
echo ""

echo "🔧 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
    
    # Verificar versión mínima (v18)
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Versión de Node.js adecuada (>=18)"
    else
        echo -e "${RED}✗${NC} Node.js versión muy antigua. Se requiere v18 o superior"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Node.js no encontrado"
    ((ERRORS++))
fi
echo ""

echo "📦 Verificando dependencias del backend..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencias del backend instaladas"
else
    echo -e "${YELLOW}⚠${NC} Dependencias del backend no instaladas"
    echo "  Ejecuta: cd backend && npm install"
fi
echo ""

echo "📦 Verificando dependencias del frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencias del frontend instaladas"
else
    echo -e "${YELLOW}⚠${NC} Dependencias del frontend no instaladas"
    echo "  Ejecuta: cd frontend && npm install"
fi
echo ""

echo "🗄️ Verificando configuración de MongoDB..."
if [ -f "backend/.env" ]; then
    MONGODB_URI=$(grep MONGODB_URI backend/.env | cut -d'=' -f2)
    if [ ! -z "$MONGODB_URI" ]; then
        echo -e "${GREEN}✓${NC} MONGODB_URI configurado"
        if [[ $MONGODB_URI == *"mongodb://localhost"* ]]; then
            echo -e "${YELLOW}ℹ${NC} Usando MongoDB local. Asegúrate de que esté corriendo."
        elif [[ $MONGODB_URI == *"mongodb+srv"* ]]; then
            echo -e "${GREEN}✓${NC} Usando MongoDB Atlas"
        fi
    else
        echo -e "${RED}✗${NC} MONGODB_URI no configurado en backend/.env"
        ((ERRORS++))
    fi
fi
echo ""

echo "🌐 Verificando configuración del frontend..."
if [ -f "frontend/.env" ]; then
    API_URL=$(grep VITE_API_URL frontend/.env | cut -d'=' -f2)
    if [ ! -z "$API_URL" ]; then
        echo -e "${GREEN}✓${NC} VITE_API_URL configurado: $API_URL"
    else
        echo -e "${RED}✗${NC} VITE_API_URL no configurado en frontend/.env"
        ((ERRORS++))
    fi
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo!${NC} El proyecto está correctamente configurado."
    echo ""
    echo "Para iniciar el proyecto:"
    echo "  1. Asegúrate de que MongoDB esté corriendo"
    echo "  2. Ejecuta: npm run dev"
    echo "  3. Abre: http://localhost:5173"
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores${NC}"
    echo "Revisa los mensajes anteriores y corrige los problemas."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
