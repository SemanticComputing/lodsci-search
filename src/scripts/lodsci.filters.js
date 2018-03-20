(function() {

    'use strict';

    angular.module('facetApp')

    /* @ngInject */
    .filter('safe', function($sce) {
        return function(html) {
            return $sce.trustAsHtml(html);
        };
    });
})();
