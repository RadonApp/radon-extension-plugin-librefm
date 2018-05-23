import DestinationPlugin from 'neon-extension-framework/Models/Plugin/Destination';


export class LibreFmPlugin extends DestinationPlugin {
    constructor() {
        super('librefm');
    }
}

export default new LibreFmPlugin();
