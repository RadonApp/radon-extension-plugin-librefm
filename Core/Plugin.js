import DestinationPlugin from '@radon-extension/framework/Models/Plugin/Destination';


export class LibreFmPlugin extends DestinationPlugin {
    constructor() {
        super('librefm');
    }
}

export default new LibreFmPlugin();
