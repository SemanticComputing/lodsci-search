(function() {
    'use strict';

    angular.module('facetApp')
    .component('lodsciValueList', {
        templateUrl: 'views/lodsci.value-list.component.html',
        controller: ValueListController,
        bindings: {
            value: '<'
        }
    });

    /* @ngInject */
    function ValueListController(_) {
        var vm = this;

        vm.$onInit = function() {
            vm.value = _.castArray(vm.value);
            vm.isResource = isResource;
        };

        function isResource(value) {
            return value && value.isResource === 'true';
        }

    }
})();
