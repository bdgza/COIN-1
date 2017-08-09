
class Faction {
    constructor(definition) {
        this.id = definition.id;
        this.name = definition.name;
        this.passResources = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            passResources: this.passResources
        };
    }
}

export default Faction;