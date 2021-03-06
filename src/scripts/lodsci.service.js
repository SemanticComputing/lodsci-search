(function() {

    'use strict';

    /* eslint-disable angular/no-service-method */
    angular.module('facetApp')

    .service('lodsciService', lodsciService);

    /* @ngInject */
    function lodsciService($q, $location, _, FacetResultHandler, tagStrippingFacetMapper) {

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
                name: 'Free Text Search',
                enabled: true
            },
            subject: {
                facetId: 'subject',
                predicate: '<http://purl.org/dc/terms/subject>',
                name: 'Keywords',
                services: ['<https://api.finto.fi/sparql>' /*, '<https://dbpedia.org/sparql>'*/],
                mapper: tagStrippingFacetMapper,
                enabled: true
            },
            rightsHolder: {
                facetId: 'rightsHolder',
                predicate: '<http://purl.org/dc/terms/rightsHolder>',
                name: 'Rights Holder',
                mapper: tagStrippingFacetMapper,
                enabled: true
            },
            creator: {
                facetId: 'creator',
                predicate: '<http://purl.org/dc/terms/creator>',
                name: 'Creator',
                mapper: tagStrippingFacetMapper,
                enabled: true
            },
            publisher: {
                facetId: 'publisher',
                predicate: '<http://purl.org/dc/terms/publisher>',
                name: 'Publisher',
                mapper: tagStrippingFacetMapper,
                enabled: true
            },
            license: {
                facetId: 'license',
                predicate: '<http://purl.org/dc/terms/license>',
                name: 'License',
                mapper: tagStrippingFacetMapper,
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
        ' PREFIX sf: <http://ldf.fi/functions#> ' +
        ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ';

        // The query for the results.
        var query =
        ' SELECT DISTINCT * WHERE {' +
        '  { ' +
        '    <RESULT_SET> ' +
        '  } ' +
        '  OPTIONAL { ?id sf:preferredLanguageLiteral (dct:title "en" "fi" "" ?title) . }' +
        '  OPTIONAL { ?id sf:preferredLanguageLiteral (dct:description "en" "fi" "" ?description) . }' +
        '  OPTIONAL {' +
        '    ?id dct:license ?license__id .' +
        '    BIND(ISURI(?license__id) AS ?license__isResource)' +
        '    OPTIONAL { ?license__id sf:preferredLanguageLiteral (skos:prefLabel rdfs:label "en" "fi" "" ?license__label) . }' +
        '  } ' +
        '  OPTIONAL {' +
        '    ?id dct:creator ?creator__id .' +
        '    BIND(ISURI(?creator__id) AS ?creator__isResource)' +
        '    OPTIONAL { ?creator__id sf:preferredLanguageLiteral (skos:prefLabel rdfs:label "en" "fi" "" ?creator__label) . }' +
        '  } ' +
        '  OPTIONAL {' +
        '    ?id dct:subject ?subject__id .' +
        '    BIND(ISURI(?subject__id) AS ?subject__isResource)' +
        '    OPTIONAL {' +
        '      SERVICE <https://api.finto.fi/sparql> {' +
        '        ?subject__id skos:prefLabel [] .' +
        '        OPTIONAL { ?subject__id skos:prefLabel ?subject__label . FILTER(langMatches(lang(?subject__label), "en")) }' +
        '        OPTIONAL { ?subject__id skos:prefLabel ?subject__label . FILTER(langMatches(lang(?subject__label), "fi")) }' +
        '        OPTIONAL { ?subject__id skos:prefLabel ?subject__label . }' +
        '      }' +
        '    }' +
        '  }' +
        '  OPTIONAL {' +
        '    ?id dct:rightsHolder ?rightsHolder__id .' +
        '    BIND(ISURI(?rightsHolder__id) AS ?rightsHolder__isResource)' +
        '    OPTIONAL { ?rightsHolder__id sf:preferredLanguageLiteral (skos:prefLabel rdfs:label "en" "fi" "" ?rightsHolder__label) . }' +
        '  } ' +
        '  OPTIONAL {' +
        '    ?id dct:publisher ?publisher__id .' +
        '    BIND(ISURI(?publisher__id) AS ?publisher__isResource)' +
        '    OPTIONAL { ?publisher__id sf:preferredLanguageLiteral (skos:prefLabel rdfs:label "en" "fi" "" ?publisher__label) . }' +
        '  } ' +
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
            preferredLang : ['en', 'fi']
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
