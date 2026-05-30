export default class SaveSystem {
    static getCoins() {
        const coins = localStorage.getItem("br_coins");
        return coins ? parseInt(coins) : 0;
    }

    static setCoins(amount) {
        localStorage.setItem("br_coins", amount);
    }

    static addCoins(amount) {
        const currentCoins = this.getCoins();
        const newCoins = currentCoins + amount;

        this.setCoins(newCoins);

        return newCoins;
    }

    static spendCoins(amount) {
        const currentCoins = this.getCoins();

        if (currentCoins < amount) {
            return false;
        }

        this.setCoins(currentCoins - amount);
        return true;
    }

    static getUnlockedCharacters() {
        const data = localStorage.getItem("br_unlocked_characters");

        if (!data) {
            return ["default"];
        }

        return JSON.parse(data);
    }

    static unlockCharacter(characterId) {
        const unlocked = this.getUnlockedCharacters();

        if (!unlocked.includes(characterId)) {
            unlocked.push(characterId);
        }

        localStorage.setItem(
            "br_unlocked_characters",
            JSON.stringify(unlocked)
        );
    }

    static isCharacterUnlocked(characterId) {
        return this.getUnlockedCharacters().includes(characterId);
    }

    static getSelectedCharacter() {
        return localStorage.getItem("br_selected_character") || "default";
    }

    static setSelectedCharacter(characterId) {
        localStorage.setItem("br_selected_character", characterId);
    }


}