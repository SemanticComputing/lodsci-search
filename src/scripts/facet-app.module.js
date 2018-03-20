/*
 * facetApp module definition
 */
(function() {

    'use strict';

    angular.module('facetApp', [
        'ui.router',
        'seco.facetedSearch',
        'ngTable',
        'angular.filter',
        'ngAnimate',
        'ngSanitize',
        'ui.bootstrap'
    ])

    .constant('_', _) // eslint-disable-line no-undef
    .constant('RESULTS_PER_PAGE', 25)
    .constant('PAGES_PER_QUERY', 1)

    .config(function($urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
    })

    .config(function($urlRouterProvider){
        $urlRouterProvider.otherwise('/');
    })

    .config(function($stateProvider) {
        $stateProvider
        .state('table', {
            url: '/',
            templateUrl: 'views/lodsci.table.html',
            controller: 'TableController',
            controllerAs: 'vm'
        });
    });
})();
