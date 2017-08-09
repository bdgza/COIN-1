class Region {
    constructor(definition) {
        this.id = definition.id;
        this.name = definition.name;
        this.adjacent = definition.adjacent;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

export default Region;