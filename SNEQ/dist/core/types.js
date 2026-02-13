"use strict";
// SNEQ - Système Narratif à État Quantique
// Core Type Definitions
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNEQSystem = exports.MoteurCollapse = exports.GrapheCoherenceNarrative = exports.ChampPotentialites = exports.RegistreCanonique = void 0;
// ==================== CANONICAL REGISTER ====================
class RegistreCanonique {
    constructor() {
        this.faits = new Map();
    }
    inscrireFait(entiteId, attribut, valeur, observation) {
        const cle = `${entiteId}:${attribut}`;
        // Check if already fixed
        if (this.faits.has(entiteId) && this.faits.get(entiteId).has(attribut)) {
            return { succes: false, raison: 'DEJA_FIGE' };
        }
        // Create fait
        const fait = {
            cle: attribut,
            valeur,
            observation,
            preuves: []
        };
        // Store
        if (!this.faits.has(entiteId)) {
            this.faits.set(entiteId, new Map());
        }
        this.faits.get(entiteId).set(attribut, fait);
        return { succes: true, faitId: cle };
    }
    getFait(entiteId, attribut) {
        if (!this.faits.has(entiteId))
            return null;
        return this.faits.get(entiteId).get(attribut) || null;
    }
    getTousFaits(entiteId) {
        if (!this.faits.has(entiteId))
            return [];
        return Array.from(this.faits.get(entiteId).values());
    }
    export() {
        const obj = {};
        for (const [entiteId, attributs] of this.faits) {
            const entries = attributs;
            obj[entiteId] = Object.fromEntries(entries);
        }
        return obj;
    }
}
exports.RegistreCanonique = RegistreCanonique;
// ==================== CHAMP DE POTENTIALITÉS ====================
class ChampPotentialites {
    constructor() {
        this.potentialites = new Map();
    }
    ajouterContrainte(entiteId, attribut, contrainte) {
        const cle = `${entiteId}:${attribut}`;
        if (!this.potentialites.has(cle)) {
            this.potentialites.set(cle, {
                entiteId,
                attribut,
                etat: 'CONTRAINT',
                contraintes: [contrainte],
                contexteGeneratif: {
                    categorieAttribut: 'SECRET', // Default
                    tentativesPrecedentes: []
                }
            });
        }
        else {
            const existing = this.potentialites.get(cle);
            existing.contraintes.push(contrainte);
        }
    }
    getPotentialite(entiteId, attribut) {
        const cle = `${entiteId}:${attribut}`;
        return this.potentialites.get(cle) || null;
    }
    getTousPotentialites(entiteId) {
        const result = [];
        for (const potentialite of this.potentialites.values()) {
            if (potentialite.entiteId === entiteId) {
                result.push(potentialite);
            }
        }
        return result;
    }
    convertirEnFige(entiteId, attribut) {
        const cle = `${entiteId}:${attribut}`;
        this.potentialites.delete(cle);
    }
    export() {
        const obj = {};
        for (const [cle, potentialite] of this.potentialites) {
            obj[potentialite.entiteId] = potentialite;
        }
        return obj;
    }
}
exports.ChampPotentialites = ChampPotentialites;
// ==================== GRAPH DE COHÉRENCE ====================
class GrapheCoherenceNarrative {
    constructor() {
        this.noeuds = new Map();
        this.aretes = new Map();
    }
    ajouterNoeud(noeud) {
        this.noeuds.set(noeud.entiteId, noeud);
    }
    ajouterArete(arete) {
        this.aretes.set(`${arete.source}:${arete.cible}`, arete);
    }
    getVoisins(entiteId) {
        const voisins = [];
        for (const arete of this.aretes.values()) {
            if (arete.source === entiteId) {
                const voisin = this.noeuds.get(arete.cible);
                if (voisin)
                    voisins.push(voisin);
            }
            if (arete.cible === entiteId) {
                const voisin = this.noeuds.get(arete.source);
                if (voisin)
                    voisins.push(voisin);
            }
        }
        return voisins;
    }
    getArete(source, cible) {
        return this.aretes.get(`${source}:${cible}`) || null;
    }
    export() {
        return {
            noeuds: Array.from(this.noeuds.values()),
            aretes: Array.from(this.aretes.values())
        };
    }
}
exports.GrapheCoherenceNarrative = GrapheCoherenceNarrative;
// ==================== MOTEUR DE COLLAPSE ====================
class MoteurCollapse {
    constructor(rc, cp, gcn) {
        this.rc = rc;
        this.cp = cp;
        this.gcn = gcn;
    }
    async collapse(demande) {
        // 1. Check if already fixed
        const existant = this.rc.getFait(demande.entiteId, demande.attribut);
        if (existant) {
            return {
                type: 'DEJA_FIGE',
                fait: existant
            };
        }
        // 2. Check if potentiality exists
        const potentialite = this.cp.getPotentialite(demande.entiteId, demande.attribut);
        if (!potentialite) {
            // Create new potentiality
            return {
                type: 'PARTIEL',
                erreurs: [{
                        type: 'FORMAT',
                        message: 'No potentiality found - first observation'
                    }]
            };
        }
        // 3. For now, simulate collapse (in real implementation, call LLM here)
        // This is where the AI would generate the value based on constraints
        // 4. Convert DemandeCollapse observation to AttributFige observation
        const observationFige = {
            timestamp: demande.observation.timestamp,
            lieu: demande.observation.lieu,
            methode: 'DIALOGUE_DIRECT', // Default mapping from trigger
            source: { type: 'OBSERVATION_DIRECTE' },
            fiabilite: 'CERTAINE'
        };
        // 5. Create fait from generation
        const fait = {
            cle: demande.attribut,
            valeur: { type: 'STRING', valeur: 'Generated value' }, // Placeholder
            observation: observationFige,
            preuves: []
        };
        // 6. Inscrire dans RC
        const inscription = this.rc.inscrireFait(demande.entiteId, demande.attribut, fait.valeur, observationFige);
        if (!inscription.succes) {
            return {
                type: 'ECHEC',
                erreurs: [{
                        type: 'CONTRADICTION_RC',
                        message: inscription.succes === false ? 'Already fixed' : 'Unknown error'
                    }]
            };
        }
        // 7. Retirer du CP
        this.cp.convertirEnFige(demande.entiteId, demande.attribut);
        // 8. Propager les contraintes
        const propagation = this.propagerContraintes(fait);
        return {
            type: 'SUCCES',
            fait,
            propagation
        };
    }
    propagerContraintes(fait) {
        const contraintesPropagees = [];
        const entitesImpactees = new Set();
        // Get neighbors from GCN
        const voisins = this.gcn.getVoisins(fait.observation.lieu);
        for (const voisin of voisins) {
            // Get potentialities for this neighbor
            const potentialitesVoisin = this.cp.getTousPotentialites(voisin.entiteId);
            // Add constraints based on relation type
            const arete = this.gcn.getArete(fait.observation.lieu, voisin.entiteId);
            if (arete) {
                contraintesPropagees.push({
                    contrainte: {
                        id: `auto_${Date.now()}`,
                        source: { type: 'RELATION', relationId: arete.id },
                        dateCreation: fait.observation.timestamp,
                        regle: {
                            type: 'CORRELE_AVEC',
                            autreEntite: fait.observation.lieu,
                            autreAttribut: fait.cle
                        },
                        justificationNarrative: `Related to observed fact: ${fait.cle}`
                    },
                    entiteCible: voisin.entiteId,
                    attributCible: arete.attributs.keys().next().value, // First attribute
                    impact: arete.forcePropagation || 0.5
                });
            }
            entitesImpactees.add(voisin.entiteId);
        }
        return {
            faitSource: fait,
            contraintesPropagees,
            entitesImpactees
        };
    }
}
exports.MoteurCollapse = MoteurCollapse;
// ==================== EXPORTS ====================
class SNEQSystem {
    constructor() {
        this.rc = new RegistreCanonique();
        this.cp = new ChampPotentialites();
        this.gcn = new GrapheCoherenceNarrative();
        this.mc = new MoteurCollapse(this.rc, this.cp, this.gcn);
    }
    // Entity management
    createEntity(entity) {
        const id = crypto.randomUUID();
        const noeud = {
            entiteId: id,
            type: entity.type,
            etatActuel: 'INCONNU',
            nombreAttributsFiges: 0,
            nombreAttributsContraints: 0,
            poidsNarratif: 0.5,
            tags: new Set()
        };
        this.gcn.ajouterNoeud(noeud);
        return {
            id,
            nomConnu: false,
            ...entity,
            dateCreation: entity.dateCreation || { jour: 1, heure: 1 },
            attributsFiges: entity.attributsFiges || new Map()
        };
    }
    createRelation(relation) {
        const id = `${relation.source}_${relation.cible}`;
        const arete = {
            id,
            source: relation.source,
            cible: relation.cible,
            typeRelation: relation.typeRelation,
            directionnalite: relation.directionnalite || 'BIDIRECTIONNELLE',
            forcePropagation: relation.forcePropagation || 0.5,
            etatArete: 'INDEFINI',
            attributs: new Map(),
            reglesPropagation: []
        };
        this.gcn.ajouterArete(arete);
        return arete;
    }
    // Constraint management
    addConstraint(entiteId, attribut, contrainte) {
        this.cp.ajouterContrainte(entiteId, attribut, contrainte);
    }
    // Main collapse interface
    async observe(demande) {
        return this.mc.collapse(demande);
    }
    // Export state
    exportState() {
        return {
            rc: this.rc.export(),
            cp: this.cp.export(),
            gcn: this.gcn.export()
        };
    }
}
exports.SNEQSystem = SNEQSystem;
