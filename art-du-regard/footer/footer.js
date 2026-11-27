/*!
 * Footer « L'Art du Regard » v1.0.0 (27/11/2026) · module NK Studio créa
 * Année du copyright mise à jour toute seule : dans tout élément [data-year], la première année écrite (ex. 2026)
 * est remplacée par l'année en cours. Le texte reste modifiable dans Webflow ; sans script, l'année écrite s'affiche.
 * Script hébergé « Footer », pied de page du site (toutes les pages).
 */
!function(){function e(){var e=String((new Date).getFullYear());document.querySelectorAll("[data-year]").forEach(function(t){for(var n,a=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);n=a.nextNode();)if(/(19|20)\d{2}/.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/(19|20)\d{2}/,e);break}})}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()}();