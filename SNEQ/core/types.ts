// SNEQ - Système Narratif à État Quantique
// Core Type Definitions

// ==================== ENTITY TYPES ====================

export type EntityType =
  | 'PERSONNAGE'
  | 'LIEU'
  | 'OBJET'
  | 'EVENEMENT'
  | 'RELATION'
  | 'FACTION';

// ==================== ATTRIBUTE STATES ====================

export type AttributState =
  | 'INDEFINI'      // Never observed, pure potential
  | 'CONTRAINT';    // Partially determined by inference
  | 'FIGE';         // Canonically observed, immutable

// ==================== ENTITY INTERFACE ====================

export interface Entity {
  id: string;                    // UUID unique
  type: EntityType;
  nom: string;                   // Canonical name once known
  nomConnu: boolean;             // Player knows true name?
  aliases: string[];             // "masked man", "the smith"
  dateCreation: GameTimestamp;
  attributsFiges: Map<string, AttributFige>;
}

export interface AttributFige {
  cle: string;                   // ex: "profession", "secret"
  valeur: AttributValue;

  // Observation metadata
  observation: {
    timestamp: GameTimestamp;
    lieu: string;                // Entity ID
    methode: ObservationMethod;
    source: SourceType;
    fiabilite: 'CERTAINE' | 'TEMOIGNAGE' | 'RUMEUR_CONFIRMEE';
  };

  // Traceability
  preuves: Preuve[];
}

export type AttributValue =
  | { type: 'STRING'; valeur: string }
  | { type: 'NUMBER'; valeur: number }
  | { type: 'BOOLEAN'; valeur: boolean }
  | { type: 'ENTITY_REF'; id: string }
  | { type: 'ENTITY_SET'; ids: string[] }
  | { type: 'ENUM'; valeur: string; enumType: string }
  | { type: 'COMPOSITE'; champs: Record<string, AttributValue> };

export type ObservationMethod =
  | 'DIALOGUE_DIRECT'      // NPC said it themselves
  | 'DOCUMENT'             // Read in book, letter
  | 'OBSERVATION_VISUELLE' // Saw with own eyes
  | 'DEDUCTION_CONFIRMEE'  // Deduced then confirmed
  | 'AVEU'                 // Revealed under coercion/confession
  | 'DEMONSTRATION';       // Proven by action (combat, magic)

export type SourceType =
  | { type: 'ENTITE'; id: string }
  | { type: 'DOCUMENT'; id: string }
  | { type: 'OBSERVATION_DIRECTE' }
  | { type: 'EVENEMENT'; id: string };

export interface Preuve {
  type: 'DIALOGUE' | 'OBJET' | 'EVENEMENT';
  reference: string;
  extrait?: string;
}

export type GameTimestamp = {
  jour: number;
  heure: number;
};

// ==================== POTENTIALITÉ ====================

export interface Potentialite {
  entiteId: string;
  attribut: string;
  etat: 'INDEFINI' | 'CONTRAINT';

  contraintes: Contrainte[];

  contexteGeneratif: ContexteGeneratif;
}

export interface Contrainte {
  id: string;
  source: ContrainteSource;
  dateCreation: GameTimestamp;

  regle: RegleContrainte;

  justificationNarrative: string;
}

export type ContrainteSource =
  | { type: 'FAIT_CANONIQUE'; faitId: string }
  | { type: 'RELATION'; relationId: string }
  | { type: 'REGLE_MONDE'; regleId: string }
  | { type: 'INFERENCE_IA'; confidence: number };

export type RegleContrainte =
  | { type: 'DOIT_ETRE'; valeurs: AttributValue[] }
  | { type: 'NE_PEUT_PAS_ETRE'; valeurs: AttributValue[] }
  | { type: 'IMPLIQUE'; condition: string; consequence: string }
  | { type: 'CORRELE_AVEC'; autreEntite: string; autreAttribut: string }
  | { type: 'RANGE_NUMERIQUE'; min?: number; max?: number }
  | { type: 'REGEX'; pattern: string }
  | { type: 'CUSTOM'; evaluateur: string };

export type ContexteGeneratif = {
  categorieAttribut: CategorieAttribut;

  tendances?: Tendance[];
  tentativesPrecedentes?: TentativePrecedente[];
}

export type CategorieAttribut =
  | 'IDENTITE'           // name, age, appearance
  | 'PSYCHOLOGIE'        // motivation, fear, desire
  | 'HISTORIQUE'         // past, events lived
  | 'SOCIAL'             // relations, status, faction
  | 'COMPETENCE'         // capacities, knowledges
  | 'SECRET'             // what entity hides
  | 'ETAT'               // current condition (wounded, in love)
  | 'POSSESSION';        // what entity owns

export interface Tendance {
  description: string;
  poids: number;  // 0-1, soft influence on AI
}

export interface TentativePrecedente {
  valeurProposee: AttributValue;
  raisonRejet: string;
}

// ==================== RELATIONS (GCN) ====================

export interface NoeudGCN {
  entiteId: string;
  type: EntityType;
  etatActuel: 'INCONNU' | 'PARTIELLEMENT_CONNU' | 'BIEN_CONNU';
  nombreAttributsFiges: number;
  nombreAttributsContraints: number;
  poidsNarratif: number;  // 0-1
  tags: Set<string>;
}

export interface AreteGCN {
  id: string;
  source: string;
  cible: string;
  typeRelation: TypeRelation;
  directionnalite: 'UNIDIRECTIONNELLE' | 'BIDIRECTIONNELLE';
  forcePropagation: number;  // 0-1
  etatArete: 'INDEFINI' | 'CONTRAINT' | 'FIGE';
  attributs: Map<string, AttributRelation>;
  reglesPropagation: ReglePropagation[];
}

export type TypeRelation =
  | { categorie: 'SOCIAL'; sous_type: RelationSociale }
  | { categorie: 'CAUSAL'; sous_type: RelationCausale }
  | { categorie: 'SPATIAL'; sous_type: RelationSpatiale }
  | { categorie: 'TEMPOREL'; sous_type: RelationTemporelle }
  | { categorie: 'CONCEPTUELLE'; sous_type: RelationConceptuelle };

export type RelationSociale =
  | 'FAMILLE'           // parent, child, sibling, spouse
  | 'AMITIE'            // friend, confidant, ally
  | 'INIMITIE'          // enemy, rival, nemesis
  | 'HIERARCHIE'        // superior, subordinate, master/apprentice
  | 'ROMANTIQUE'        // love, ex, suitor
  | 'PROFESSIONNELLE'   // colleague, client, supplier
  | 'APPARTENANCE';     // faction/group member

export type RelationCausale =
  | 'A_CAUSE'           // A caused B
  | 'A_PERMIS'          // A made B possible
  | 'A_EMPECHE'         // A prevented B
  | 'CONSEQUENCE_DE'    // A is consequence of B
  | 'MOTIVE_PAR'        // A is motivated by B
  | 'REVELEE_PAR';      // A revealed via B

export type RelationSpatiale =
  | 'CONTIENT'          // place contains place/object
  | 'ADJACENT'          // neighboring places
  | 'ORIGINE'           // person comes from place
  | 'RESIDE'            // person inhabits place
  | 'FREQUENTE';        // person visits often

export type RelationTemporelle =
  | 'PRECEDE'           // event before event
  | 'PENDANT'           // simultaneous
  | 'DECLENCHE';        // event triggers event

export type RelationConceptuelle =
  | 'SYMBOLE'           // object/place represents concept
  | 'CONTRASTE'         // thematic opposition
  | 'PARALLELE'         // narrative mirror
  | 'SECRET_LIE';       // interconnected secrets

export interface AttributRelation {
  cle: string;
  etat: 'INDEFINI' | 'CONTRAINT' | 'FIGE';
  valeur?: AttributValue;
  contraintes: Contrainte[];
}

export interface ReglePropagation {
  id: string;
  nom: string;
  declencheur: DeclencheurPropagation;
  action: ActionPropagation;
  priorite: number;
}

export interface DeclencheurPropagation {
  typeFait: {
    entiteType?: EntityType[];
    attribut?: string[];
    categorieAttribut?: CategorieAttribut[];
  };
  conditions?: ConditionPropagation[];
}

export interface ConditionPropagation {
  type: 'VALEUR_EGALE' | 'VALEUR_CONTIENT' | 'RELATION_EXISTE' | 'ATTRIBUT_FIGE';
  parametres: Record<string, any>;
}

export interface ActionPropagation {
  type: ActionTypePropagation;
  cible: CiblePropagation;
  parametres: Record<string, any>;
}

export type ActionTypePropagation =
  | 'AJOUTER_CONTRAINTES'
  | 'MODIFIER_FORCE_RELATION'
  | 'CREER_RELATION'
  | 'MARQUER_POUR_REEVALUATION'
  | 'DECLENCHER_EVENEMENT';

export type CiblePropagation =
  | { type: 'RELATION_DIRECTE' }
  | { type: 'CHEMIN'; longueurMax: number }
  | { type: 'TAG'; tag: string }
  | { type: 'ENTITE_SPECIFIQUE'; entiteId: string };

// ==================== COLLAPSE ENGINE ====================

export interface DemandeCollapse {
  entiteId: string;
  attribut: string;
  observation: {
    timestamp: GameTimestamp;
    lieu: string;
    methode: DeclencheurObservation;
  };
  contraintesContextuelles?: Contrainte[];
  options: OptionsCollapse;
}

export type DeclencheurObservation =
  | { type: 'DIALOGUE'; pnjId: string; ligneDialogue: string }
  | { type: 'EXPLORATION'; zoneId: string; action: string }
  | { type: 'LECTURE'; documentId: string }
  | { type: 'EVENEMENT'; evenementId: string }
  | { type: 'COMBAT'; cibleId: string }
  | { type: 'COMPETENCE'; competence: string };

export interface OptionsCollapse {
  profondeur: 'MINIMALE' | 'STANDARD' | 'DETAILLEE';
  registre: 'NEUTRE' | 'DRAMATIQUE' | 'HUMORISTIQUE' | 'SOMBRE';
  timeoutMs: number;
  maxTentatives: number;
  accepterPartiel: boolean;
}

export interface ResultatCollapse {
  type: 'SUCCES' | 'DEJA_FIGE' | 'ECHEC' | 'PARTIEL';
  fait?: AttributFige;
  propagation?: PropagationResult;
  erreurs?: ErreurValidation[];
}

export interface PropagationResult {
  faitSource: AttributFige;
  contraintesPropagees: ContraintePropagee[];
  entitesImpactees: Set<string>;
}

export interface ContraintePropagee {
  contrainte: Contrainte;
  entiteCible: string;
  attributCible: string;
  impact: number;  // 0-1
}

export interface ErreurValidation {
  type: 'FORMAT' | 'CONTRAINTE_STRICTE' | 'CONTRAINTE_SOUPLE' | 'CONTRADICTION_RC' | 'SEMANTIQUE';
  message: string;
  details?: any;
}

// ==================== CANONICAL REGISTER ====================

export class RegistreCanonique {
  private faits: Map<string, Map<string, AttributFige>> = new Map();

  inscrireFait(
    entiteId: string,
    attribut: string,
    valeur: AttributValue,
    observation: AttributFige['observation']
  ): { succes: boolean; faitId?: string } {

    const cle = `${entiteId}:${attribut}`;

    // Check if already fixed
    if (this.faits.has(entiteId) && this.faits.get(entiteId)!.has(attribut)) {
      return { succes: false, raison: 'DEJA_FIGE' };
    }

    // Create fait
    const fait: AttributFige = {
      cle: attribut,
      valeur,
      observation
    };

    // Store
    if (!this.faits.has(entiteId)) {
      this.faits.set(entiteId, new Map());
    }
    this.faits.get(entiteId)!.set(attribut, fait);

    return { succes: true, faitId: cle };
  }

  getFait(entiteId: string, attribut: string): AttributFige | null {
    if (!this.faits.has(entiteId)) return null;
    return this.faits.get(entiteId)!.get(attribut) || null;
  }

  getTousFaits(entiteId: string): AttributFige[] {
    if (!this.faits.has(entiteId)) return [];
    return Array.from(this.faits.get(entiteId)!.values()) as AttributFige[];
  }

  export(): any {
    const obj: any = {};
    for (const [entiteId, attributs] of this.faits) {
      const entries = attributs as unknown as [string, AttributFige][];
      obj[entiteId] = Object.fromEntries(entries);
    }
    return obj;
  }
}

// ==================== CHAMP DE POTENTIALITÉS ====================

export class ChampPotentialites {
  private potentialites: Map<string, Potentialite> = new Map();

  ajouterContrainte(
    entiteId: string,
    attribut: string,
    contrainte: Contrainte
  ): void {

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
    } else {
      const existing = this.potentialites.get(cle)!;
      existing.contraintes.push(contrainte);
    }
  }

  getPotentialite(entiteId: string, attribut: string): Potentialite | null {
    const cle = `${entiteId}:${attribut}`;
    return this.potentialites.get(cle) || null;
  }

  convertirEnFige(entiteId: string, attribut: string): void {
    const cle = `${entiteId}:${attribut}`;
    this.potentialites.delete(cle);
  }

  export(): any {
    const obj: any = {};
    for (const [cle, potentialite] of this.potentialites) {
      obj[potentialite.entiteId] = potentialite;
    }
    return obj;
  }
}

// ==================== GRAPH DE COHÉRENCE ====================

export class GrapheCoherenceNarrative {
  private noeuds: Map<string, NoeudGCN> = new Map();
  private aretes: Map<string, AreteGCN> = new Map();

  ajouterNoeud(noeud: NoeudGCN): void {
    this.noeuds.set(noeud.entiteId, noeud);
  }

  ajouterArete(arete: AreteGCN): void {
    this.aretes.set(`${arete.source}:${arete.cible}`, arete);
  }

  getVoisins(entiteId: string): NoeudGCN[] {
    const voisins: NoeudGCN[] = [];
    for (const arete of this.aretes.values()) {
      if (arete.source === entiteId) {
        const voisin = this.noeuds.get(arete.cible);
        if (voisin) voisins.push(voisin);
      }
      if (arete.cible === entiteId) {
        const voisin = this.noeuds.get(arete.source);
        if (voisin) voisins.push(voisin);
      }
    }
    return voisins;
  }

  getArete(source: string, cible: string): AreteGCN | null {
    return this.aretes.get(`${source}:${cible}`) || null;
  }

  export(): any {
    return {
      noeuds: Array.from(this.noeuds.values()),
      aretes: Array.from(this.aretes.values())
    };
  }
}

// ==================== MOTEUR DE COLLAPSE ====================

export class MoteurCollapse {
  private rc: RegistreCanonique;
  private cp: ChampPotentialites;
  private gcn: GrapheCoherenceNarrative;

  constructor(rc: RegistreCanonique, cp: ChampPotentialites, gcn: GrapheCoherenceNarrative) {
    this.rc = rc;
    this.cp = cp;
    this.gcn = gcn;
  }

  async collapse(demande: DemandeCollapse): Promise<ResultatCollapse> {

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

    // 4. Create fait from generation
    const fait: AttributFige = {
      cle: demande.attribut,
      valeur: { type: 'STRING', valeur: 'Generated value' }, // Placeholder
      observation: demande.observation
    };

    // 5. Inscrire dans RC
    const inscription = this.rc.inscrireFait(
      demande.entiteId,
      demande.attribut,
      fait.valeur,
      demande.observation
    );

    if (!inscription.succes) {
      return {
        type: 'ECHEC',
        erreurs: [{
          type: 'CONTRADICTION_RC',
          message: inscription.succes === false ? 'Already fixed' : 'Unknown error'
        }]
      };
    }

    // 6. Retirer du CP
    this.cp.convertirEnFige(demande.entiteId, demande.attribut);

    // 7. Propager les contraintes
    const propagation = this.propagerContraintes(fait);

    return {
      type: 'SUCCES',
      fait,
      propagation
    };
  }

  private propagerContraintes(fait: AttributFige): PropagationResult {

    const contraintesPropagees: ContraintePropagee[] = [];
    const entitesImpactees = new Set<string>();

    // Get neighbors from GCN
    const voisins = this.gcn.getVoisins(fait.observation.lieu);

    for (const voisin of voisins) {
      // Get potentialities for this neighbor
      const potentialitesVoisin = this.cp.getTousFaits(voisin.entiteId);

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

// ==================== EXPORTS ====================

export class SNEQSystem {
  private rc: RegistreCanonique;
  private cp: ChampPotentialites;
  private gcn: GrapheCoherenceNarrative;
  private mc: MoteurCollapse;

  constructor() {
    this.rc = new RegistreCanonique();
    this.cp = new ChampPotentialites();
    this.gcn = new GrapheCoherenceNarrative();
    this.mc = new MoteurCollapse(this.rc, this.cp, this.gcn);
  }

  // Entity management
  createEntity(entity: Omit<Entity, 'id'>): Entity {
    const id = entity.id || crypto.randomUUID();
    const noeud: NoeudGCN = {
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
      ...entity,
      dateCreation: { jour: 1, heure: 1 },
      attributsFiges: new Map()
    };
  }

  createRelation(relation: Omit<AreteGCN, 'id'>): AreteGCN {
    const id = relation.id || `${relation.source}_${relation.cible}`;
    const arete: AreteGCN = {
      id,
      ...relation,
      etatArete: 'INDEFINI',
      attributs: new Map(),
      reglesPropagation: []
    };

    this.gcn.ajouterArete(arete);

    // Update node awareness
    const sourceNode = this.gcn.getVoisins(relation.source);
    const targetNode = this.gcn.getVoisins(relation.cible);

    return arete;
  }

  // Main collapse interface
  async observe(demande: DemandeCollapse): Promise<ResultatCollapse> {
    return this.mc.collapse(demande);
  }

  // Export state
  exportState(): any {
    return {
      rc: this.rc.export(),
      cp: this.cp.export(),
      gcn: this.gcn.export()
    };
  }
}
