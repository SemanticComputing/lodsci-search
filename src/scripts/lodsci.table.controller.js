/*
 * Semantic faceted search
 *
 */

(function() {

    'use strict';

    angular.module('facetApp')

    /*
    * Controller for the results view.
    */
    .controller('TableController', TableController);

    /* @ngInject */
    function TableController($scope, $state, $uibModal, _, RESULTS_PER_PAGE,
                lodsciService, NgTableParams, FacetHandler, facetUrlStateHandlerService) {

        var vm = this;

        vm.openPage = openPage;
        vm.toArray = toArray;
        vm.removeFacetSelections = removeFacetSelections;
        vm.sortBy = sortBy;
        vm.getSortClass = lodsciService.getSortClass;

        var initListener = $scope.$on('sf-initial-constraints', function(event, config) {
            updateResults(event, config);
            initListener();
        });
        $scope.$on('sf-facet-constraints', updateResults);

        lodsciService.getFacets().then(function(facets) {
            vm.facets = facets;
            vm.facetOptions = getFacetOptions();
            vm.facetOptions.scope = $scope;
            vm.handler = new FacetHandler(vm.facetOptions);
        });

        function toArray(value) {
            return _.castArray(value);
        }

        function removeFacetSelections() {
            $state.reload();
        }

        function initializeTable() {
            vm.tableParams = new NgTableParams(
                {
                    count: RESULTS_PER_PAGE
                },
                {
                    getData: getData
                }
            );
        }

        function openPage(person) {
            $uibModal.open({
                component: 'registerPageModal',
                size: 'lg',
                resolve: {
                    person: function() { return person; }
                }
            });
        }

        function getFacetOptions() {
            var options = lodsciService.getFacetOptions();
            options.initialState = facetUrlStateHandlerService.getFacetValuesFromUrlParams();
            return options;
        }

        function getData(params) {
            vm.isLoadingResults = true;

            return vm.pager.getPage(params.page() - 1, params.count())
            .then(function(page) {
                return vm.pager.getTotalCount().then(function(count) {
                    vm.tableParams.total(count);
                    return page;
                }).then(function(page) {
                    vm.isLoadingResults = false;
                    return page;
                });
            });
        }

        function updateResults(event, facetSelections) {
            facetUrlStateHandlerService.updateUrlParams(facetSelections);
            vm.previousSelections = _.clone(facetSelections.constraint);

            return fetchResults(facetSelections);
        }

        function fetchResults(facetSelections) {
            vm.isLoadingResults = true;

            lodsciService.getResults(facetSelections)
            .then(function(pager) {
                vm.pager = pager;
                if (vm.tableParams) {
                    vm.tableParams.page(1);
                    vm.tableParams.reload();
                } else {
                    initializeTable();
                }
            });
        }

        function sortBy(sortBy) {
            lodsciService.updateSortBy(sortBy);
            return fetchResults({ constraint: vm.previousSelections });
        }
    }
})();
