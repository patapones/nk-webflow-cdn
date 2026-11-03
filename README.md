# nk-webflow-cdn

Code hébergé pour les sites Webflow de NK Studio créa (Kevin), servi par jsDelivr :
`https://cdn.jsdelivr.net/gh/patapones/nk-webflow-cdn@VERSION/chemin/fichier`

Ici, uniquement les **fichiers publiés** (minifiés). Les sources lisibles sont dans
`~/Documents/Claude-projets/Kit-Webflow/code/` : on modifie toujours la source, puis on minifie.

## Publier une nouvelle version (fait par Claude)
1. Modifier la source lisible dans `Kit-Webflow/code/`, tester sans publier (Chrome automatique, page en ligne avec substitution).
2. Minifier vers ce dossier : `npx -y terser@5 source.js -c -m -o chemin/fichier.min.js`.
3. `git commit`, `git tag vX.Y.Z`, `git push origin main --tags`.
4. Vérifier que jsDelivr sert bien le fichier (`curl` + comparaison), puis changer `@vX.Y.Z` dans le code de la page Webflow et publier.
Jamais `@main` ni `@latest` dans Webflow : une étiquette = une version figée.

## Contenu
| Dossier | Page | Version en ligne |
|---|---|---|
| `art-du-regard/demo-realisations/` | lart-du-regard.webflow.io/demo-realisations | v0.6.1 (03/11/2026 : plus de défilement tout seul après le clic sur une vignette du bord) · v0.6.0 (curseur rond fixe + traînée, mode différence) · v0.5.0 (rond encre étiré) · v0.4.0 (tourné de page pendant le vol, validé) · v0.3.0 enroulement · v0.2.0 courbure · v0.1.0 = état validé du 29/10 |

`realisations.min.js` = `realisations-donnees-survol.js` + `realisations-courbure.js` + `realisations-vol.js` + `realisations-proto.js` (dans cet ordre).
`curseur.min.js` = `Kit-Webflow/code/curseur.js` minifié.
