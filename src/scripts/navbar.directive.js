(function() {
    'use strict';

    angular.module('facetApp')

    .directive('lodsciNavbar', lodsciNavbarDirective);

    /* @ngInject */
    function lodsciNavbarDirective($templateRequest, $compile, $uibModal) {
        return {
            controller: NavbarController,
            templateUrl: 'views/navbar-fi.html',
            controllerAs: 'vm'
        };

        function NavbarController() {
            var vm = this;

            vm.showHelp = showHelp;

            function showHelp() {
                $uibModal.open({
                    templateUrl: 'views/help.html',
                    size: 'lg'
                });
            }

        }
    }
})();
