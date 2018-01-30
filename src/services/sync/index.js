import Registry from 'neon-extension-framework/core/registry';
import SyncService from 'neon-extension-framework/services/destination/sync';

import Plugin from '../../core/plugin';


export class LibreFmSyncService extends SyncService {
    constructor() {
        super(Plugin);
    }
}

// Register service
Registry.registerService(new LibreFmSyncService());
