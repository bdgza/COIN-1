import FactionPiece from '../../common/factionPiece';

class Legion extends FactionPiece {
    constructor(definition) {

        definition.type = 'legion';
        definition.isMobile = true;
        super(definition);
    }
}

export default Legion;