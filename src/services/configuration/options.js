import {Group, Page, EnableOption} from 'neon-extension-framework/services/configuration/models';

import AuthenticationOption from './models/authentication';
import Plugin from '../../core/plugin';


export default [
    new Page(Plugin, null, [
        new EnableOption(Plugin, 'enabled', {
            default: false,

            type: 'plugin',
            permissions: true,
            contentScripts: true
        }),

        new AuthenticationOption(Plugin, 'authorization', {
            requires: ['enabled']
        }),

        new Group(Plugin, 'scrobble', [
            new EnableOption(Plugin, 'enabled', {
                default: true,
                requires: ['enabled'],

                type: 'service'
            })
        ])
    ])
];
