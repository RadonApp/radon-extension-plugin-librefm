import {Group, Page} from 'neon-extension-framework/Models/Configuration';
import {EnableOption} from 'neon-extension-framework/Models/Configuration/Options';

import Plugin from '../../Core/Plugin';
import {AuthenticationOption} from '../../Models/Configuration';


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
