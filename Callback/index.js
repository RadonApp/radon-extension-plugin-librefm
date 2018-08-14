import IsNil from 'lodash-es/isNil';
import QueryString from 'querystring';

import Plugin from '../Core/Plugin';


(function() {
    let $status = document.querySelector('.status');
    let $title = document.querySelector('.title');
    let $description = document.querySelector('.description');

    function updateStatus(status, {title, description}) {
        // Update status classes
        if(!$status.classList.contains(status)) {
            $status.classList.remove('success', 'error');
            $status.classList.add(status);
        }

        // Update message title
        if(!IsNil(title)) {
            $title.textContent = title;
        } else {
            $title.textContent = '';
        }

        // Update message description
        if(!IsNil(description)) {
            $description.textContent = description;
        } else {
            $description.textContent = '';
        }
    }

    function onError(error) {
        // Display error
        updateStatus('error', error);
    }

    Plugin.createI18n(['callback']).then((t) => {
        let communicationTimeout;

        function onSuccess() {
            // Clear the communication timeout handler
            if(!IsNil(communicationTimeout)) {
                clearTimeout(communicationTimeout);
            }

            // Display completion message
            updateStatus('success', {
                'title': t('success.title'),
                'description': t('success.description')
            });
        }

        function onTimeout() {
            onError({
                title: t('error.timeout.title'),
                description: t('error.timeout.description')
            });
        }

        function process() {
            let messaging = Plugin.messaging.service('authentication');

            // Bind events
            messaging.once('success', onSuccess);
            messaging.once('error', onError);

            // Ensure search parameters exist
            if(window.location.search.length < 2) {
                onError({
                    title: t('error.parameters.title'),
                    description: t('error.parameters.description')
                });
                return;
            }

            // Decode query parameters
            let query = QueryString.decode(
                window.location.search.substring(1)
            );

            // Ensure token is defined
            if(IsNil(query.token)) {
                onError({
                    title: t('error.token.title'),
                    description: t('error.token.description')
                });
                return;
            }

            // Emit authentication token
            messaging.emit('callback', query);

            // Display communication error if no response is returned in 15 seconds
            communicationTimeout = setTimeout(onTimeout, 15 * 1000);
        }

        // Update page title
        document.title = t('title');

        // Process callback
        process();
    }, (err) => {
        if(Array.isArray(err) && err.length > 0) {
            err = err[0];
        }

        if(err.message) {
            err = err.message;
        }

        // Display error on page
        onError({ description: err });
    });
})();
