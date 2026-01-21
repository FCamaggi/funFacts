# Script para iniciar MongoDB local
# Solo necesario si usas MongoDB local en desarrollo

# macOS (si instalaste con Homebrew)
brew services start mongodb-community

# O inicia manualmente
# mongod --dbpath ~/data/db

echo "MongoDB iniciado en mongodb://localhost:27017"
