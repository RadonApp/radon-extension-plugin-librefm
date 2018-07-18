import Get from 'lodash-es/get';
import IsNil from 'lodash-es/isNil';
import OmitBy from 'lodash-es/omitBy';

import Registry from 'neon-extension-framework/Core/Registry';
import ScrobbleService from 'neon-extension-framework/Services/Destination/Scrobble';
import {MediaTypes} from 'neon-extension-framework/Core/Enums';

import Client from '../../Api/Client';
import Log from '../../Core/Logger';
import Plugin from '../../Core/Plugin';


export class Scrobble extends ScrobbleService {
    constructor() {
        super(Plugin, [
            MediaTypes.Music.Track
        ]);
    }

    onStarted(session) {
        let request = this._buildRequest(session.item);

        if(request === null) {
            Log.warn('Unable to build request for session:', session);
            return;
        }

        // Update now playing status
        Client['track'].updateNowPlaying(request).then((response) => {
            Log.info('TODO: Handle "updateNowPlaying" response:', response);
        }, (body, statusCode) => {
            Log.info('TODO: Handle "updateNowPlaying" error, status code: %o, body: %O', statusCode, body);
        });
    }

    onStopped(session) {
        if(session.progress < 80) {
            return;
        }

        // Scrobble track
        this._scrobble(session).then((response) => {
            Log.info('TODO: Handle "scrobble" response:', response);
        }, (body, statusCode) => {
            Log.info('TODO: Handle "scrobble" error, status code: %o, body: %O', statusCode, body);
        });
    }

    // region Private methods

    _scrobble(session) {
        let request = this._buildRequest(session.item);

        if(request === null) {
            return Promise.reject(new Error('Unable to build request for session: ' + session));
        }

        // Set `item` timestamp
        request.timestamp = Math.round(Date.now() / 1000);

        // Scrobble track
        return Client['track'].scrobble([request]);
    }

    _buildRequest(track) {
        if(track.type !== MediaTypes.Music.Track) {
            return null;
        }

        // Ensure duration is defined (to avoid invalid items)
        if(IsNil(track.duration)) {
            return null;
        }

        // Build request
        let request = {
            artist: Get(track, 'artist.title'),
            track: Get(track, 'title'),

            // Album (optional)
            album: Get(track, 'album.title'),
            albumArtist: Get(track, 'album.artist.title'),

            // Additional details (optional)
            duration: track.duration / 1000,
            trackNumber: Get(track, 'number')
        };

        // Remove "albumArtist" if it matches "artist"
        if(request.albumArtist === request.artist) {
            delete request.albumArtist;
        }

        // Remove undefined properties
        return OmitBy(request, IsNil);
    }

    // endregion
}

// Register service
Registry.registerService(new Scrobble());
