(function() {

    'use strict';

    /* eslint-disable angular/no-service-method */
    angular.module('facetApp')

    .service('lodsciService', lodsciService);

    /* @ngInject */
    function lodsciService($q, $location, _, FacetResultHandler) {

        var DEFAULT_SORT_KEY = '?id';

        /* Public API */

        // Get the results based on facet selections.
        // Return a promise.
        this.getResults = getResults;
        // Get the facets.
        // Return a promise (because of translation).
        this.getFacets = getFacets;
        // Get the facet options.
        // Return an object.
        this.getFacetOptions = getFacetOptions;
        // Update sorting URL params.
        this.updateSortBy = updateSortBy;
        // Get the CSS class for the sort icon.
        this.getSortClass = getSortClass;

        /* Implementation */

        var facets = {
            text: {
                facetId: 'text',
                predicate: '<http://purl.org/dc/terms/description>',
                name: 'Haku',
                enabled: true
            },
            subject: {
                facetId: 'subject',
                predicate: '<http://purl.org/dc/terms/subject>',
                name: 'Subject',
                enabled: true
            },
            rightsHolder: {
                facetId: 'rightsHolder',
                predicate: '<http://purl.org/dc/terms/rightsHolder>',
                name: 'Rights Holder',
                enabled: true
            },
            creator: {
                facetId: 'creator',
                predicate: '<http://purl.org/dc/terms/creator>',
                name: 'Creator',
                enabled: true
            },
            publisher: {
                facetId: 'publisher',
                predicate: '<http://purl.org/dc/terms/publisher>',
                name: 'Publisher',
                enabled: true
            },
            license: {
                facetId: 'license',
                predicate: '<http://purl.org/dc/terms/license>',
                name: 'License',
                enabled: true
            }
        };

        var prefixes =
        ' PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
        ' PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
        ' PREFIX schema: <http://schema.org/> ' +
        ' PREFIX dct: <http://purl.org/dc/terms/> ' +
        ' PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
        ' PREFIX xml: <http://www.w3.org/XML/1998/namespace> ' +
        ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ';

        // The query for the results.
        var query =
        ' SELECT DISTINCT * WHERE {' +
        '  { ' +
        '    <RESULT_SET> ' +
        '  } ' +
        '  OPTIONAL { ?id dct:title ?title . FILTER(lang(?title) = "en") }' +
        '  OPTIONAL { ?id dct:title ?title . FILTER(lang(?title) = "fi") }' +
        '  OPTIONAL { ?id dct:title ?title . }' +
        '  OPTIONAL { ?id dct:description ?description . }' +
        '  OPTIONAL { ?id dct:license ?license . }' +
        '  OPTIONAL { ?id dct:creator ?creator . FILTER(lang(?creator) = "en") }' +
        '  OPTIONAL { ?id dct:creator ?creator . FILTER(lang(?creator) = "fi") }' +
        '  OPTIONAL { ?id dct:creator ?creator . }' +
        '  OPTIONAL { ?id dct:subject ?subject . }' +
        '  OPTIONAL { ?id dct:rightsHolder ?rightsHolder . }' +
        '  OPTIONAL { ?id dct:publisher ?publisher . } ' +
        ' }';

        // The SPARQL endpoint URL
        var endpointUrl = 'https://ldf.fi/service-descriptions/sparql';

        var facetOptions = {
            endpointUrl: endpointUrl,
            rdfClass: '<http://www.w3.org/ns/sparql-service-description#Dataset>',
            constraint:
                '  OPTIONAL { ?id <http://purl.org/dc/terms/title> ?title . FILTER(lang(?title) = "en") }' +
                '  OPTIONAL { ?id <http://purl.org/dc/terms/title> ?title . FILTER(lang(?title) = "fi") }' +
                '  OPTIONAL { ?id <http://purl.org/dc/terms/title> ?title . }',
            preferredLang : 'fi'
        };

        var resultOptions = {
            queryTemplate: query,
            prefixes: prefixes,
            pagesPerQuery: 2 // get two pages of results per query
        };

        // The FacetResultHandler handles forming the final queries for results,
        // querying the endpoint, and mapping the results to objects.
        var resultHandler = new FacetResultHandler(endpointUrl, resultOptions);

        function getResults(facetSelections) {
            return resultHandler.getResults(facetSelections, getSortBy());
        }

        function getFacets() {
            var facetsCopy = angular.copy(facets);
            return $q.when(facetsCopy);
        }

        function getFacetOptions() {
            return facetOptions;
        }

        function updateSortBy(sortBy) {
            var sort = $location.search().sortBy || '?id';
            if (sort === sortBy) {
                $location.search('desc', $location.search().desc ? null : true);
            }
            $location.search('sortBy', sortBy);
        }

        function getSortBy() {
            var sortBy = $location.search().sortBy;
            if (!_.isString(sortBy)) {
                sortBy = DEFAULT_SORT_KEY;
            }
            var sort;
            if ($location.search().desc) {
                sort = 'DESC(' + sortBy + ')';
            } else {
                sort = sortBy;
            }
            return sortBy === DEFAULT_SORT_KEY ? sort : sort + ' ' + DEFAULT_SORT_KEY;
        }

        function getSortClass(sortBy, numeric) {
            var sort = $location.search().sortBy || DEFAULT_SORT_KEY;
            var cls = numeric ? 'glyphicon-sort-by-order' : 'glyphicon-sort-by-alphabet';

            if (sort === sortBy) {
                if ($location.search().desc) {
                    return cls + '-alt';
                }
                return cls;
            }
        }
    }
})();
