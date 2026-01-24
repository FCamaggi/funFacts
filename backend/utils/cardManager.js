import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CardManager {
    constructor() {
        this.allCards = [];
        this.loadCards();
    }

    loadCards() {
        const cardsPath = path.join(__dirname, '../../cards');
        const files = fs.readdirSync(cardsPath).filter(f => f.endsWith('.json'));

        files.forEach(file => {
            const content = fs.readFileSync(path.join(cardsPath, file), 'utf8');
            const category = JSON.parse(content);

            category.cards.forEach(card => {
                this.allCards.push({
                    ...card,
                    categoryId: category.categoryId,
                    categoryName: category.categoryName
                });
            });
        });

        console.log(`Loaded ${this.allCards.length} cards from ${files.length} categories`);
    }

    getRandomCard(excludeIds = []) {
        const availableCards = this.allCards.filter(card => !excludeIds.includes(card.id));

        if (availableCards.length === 0) {
            return null; // No hay más cartas disponibles
        }

        const randomIndex = Math.floor(Math.random() * availableCards.length);
        return availableCards[randomIndex];
    }

    getCardById(cardId) {
        return this.allCards.find(card => card.id === cardId);
    }
}

export default new CardManager();
