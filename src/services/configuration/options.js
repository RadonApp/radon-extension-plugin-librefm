import {Group, Page, EnableOption} from 'neon-extension-framework/services/configuration/models';

import AuthenticationOption from './models/authentication';
import Plugin from '../../core/plugin';


export default [
    new Page(Plugin, null, Plugin.title, [
        new EnableOption(Plugin, 'enabled', 'Enabled', {
            default: false,

            type: 'plugin',
            permissions: true,
            contentScripts: true
        }),

        new AuthenticationOption(Plugin, 'authorization', 'Authentication', {
            requires: ['enabled']
        }),

        new Group(Plugin, 'scrobble', 'Scrobble', [
            new EnableOption(Plugin, 'enabled', 'Enabled', {
                default: true,
                requires: ['enabled'],

                type: 'service'
            })
        ])
    ])
];
