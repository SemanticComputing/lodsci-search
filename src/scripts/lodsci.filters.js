(function() {

    'use strict';

    angular.module('facetApp')

    /* @ngInject */
    .filter('safe', function($sanitize) {
        return function(html) {
            return $sanitize(html);
        };
    });
})();
