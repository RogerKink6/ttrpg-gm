# SNEQ Integration Guide for ttrpg-gm Skill

## Overview

SNEQ (Système Narratif à État Quantique) enhances ttrpg-gm with:
- **Superposition Narrative**: Unobserved attributes exist as potential
- **Collapse by Observation**: Player interactions crystallize possibilities into facts
- **Automated Constraint Propagation**: Each fact influences connected entities
- **Guaranteed Coherence**: RC prevents contradictions

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TTRPG-GM + SNEQ           │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
    ┌───┴───┐   ┌─────┴─────┐   ┌─┴───────┐
    │   RC   │   │     CP     │   │   GCN   │
    │ Immutable│   │Potentialities│   │Relations │
    └────────┘   └─────────────┘   └──────────┘
         │              │               │
         └──────────────┴───────────────┘
                    │
              ┌─────┴─────┐
              │   MC       │
              │ Collapse   │
              └─────────────┘
```

## Integration Points

### 1. Character Creation

When creating NPCs in ttrpg-gm, add SNEQ metadata:

```typescript
import { SNEQSystem } from './sneq/core/types';

const sneq = new SNEQSystem();

const forgeron = sneq.createEntity({
  type: 'PERSONNAGE',
  nom: "Aldric Fervent",
  aliases: ["le forgeron", "le vieux grincheux"]
});

// Add potentialities (unobserved attributes)
sneq.cp.ajouterContrainte(forgeron.id, "profession", {
  id: "ctr_profession",
  source: { type: 'REGLE_MONDE', regleId: "blacksmith" },
  dateCreation: { jour: 1, heure: 14 },
  regle: {
    type: 'DOIT_ETRE',
    valeurs: [
      { type: 'STRING', valeur: "forgeron" },
      { type: 'STRING', valeur: "armurier" }
    ]
  },
  justificationNarrative: "Smith in village"
});

sneq.createRelation(sneq.createEntity({
  type: 'PERSONNAGE',
  nom: "Marcus"
}), {
  categorie: 'SOCIAL',
  sous_type: 'AMITIE',
  forcePropagation: 0.7
});
```

### 2. Dialogue Generation

Before generating NPC dialogue, check if attributes need collapse:

```typescript
// Player: "Tell me about your past"
const demande = {
  entiteId: forgeron.id,
  attribut: "histoire_passe",
  observation: {
    timestamp: { jour: 3, heure: 20 },
    lieu: currentPlayerLocation,
    methode: { type: 'DIALOGUE', pnjId: forgeron.id },
    declencheur: { type: 'DIALOGUE', pnjId: forgeron.id }
  }
};

const resultat = await sneq.observe(demande);

if (resultat.type === 'SUCCES') {
  // New fact crystallized!
  console.log(`FACT CRYSTALLIZED: ${resultat.fait.valeur}`);

  // Constraints propagated to connected entities
  resultat.propagation.contraintesPropagees.forEach(c => {
    console.log(`NEW CONSTRAINT on ${c.entiteCible}: ${c.contrainte.justificationNarrative}`);
  });

  // Generate dialogue with this new context
  return generateDialogueWithFact(resultat.fait);
}
```

### 3. Hidden D20 Integration

SNEQ enhances ttrpg-gm's hidden roll system:

```typescript
// Existing ttrpg-gm hidden roll
if (rollType === 'HIDDEN') {
  const demande = {
    entiteId: targetId,
    attribut: competence,
    observation: {
      timestamp: gameTimestamp,
      lieu: locationId,
      methode: { type: 'COMPETENCE', competence }
    }
  };

  const resultat = await sneq.observe(demande);

  if (resultat.type === 'SUCCES') {
    // Success! This attribute is now FIGE
    // Propagates constraints to related entities
    console.log(`Competence ${competence} crystallized at level ${resultat.fait.valeur}`);

    return {
      succes: true,
      niveau: resultat.fait.valeur,
      consequences: resultat.propagation.contraintesPropagees
    };
  }
}
```

### 4. Dual-Consequence Tracking

SNEQ provides automated tracking of both consequence types:

**World State (RC):**
- All observed facts stored in Registre Canonique
- Immutable once FIGE
- Tracked per entity and location

**Relationships (GCN):**
- Relations between entities tracked
- Constraint propagation happens automatically
- Hidden influences revealed over time

```typescript
// Example: Player discovers Aldric's military past

const resultat = await sneq.observe({
  entiteId: forgeron.id,
  attribut: "passe_militaire",
  observation: { /* ... */ }
});

// Result:
// 1. forgeron.passe_militaire = true (FIGE in RC)
// 2. tavernier.secret = CONSTRAINT (related to Aldric)
// 3. duke.crimes = CONSTRAINT (Aldric served him)
// 4. New dialogue options appear based on these constraints
```

## Migration Steps

### Phase 1: Core Setup (Current)
- ✅ SNEQ types defined
- ✅ RC, CP, GCN, MC implemented
- ✅ Integration guide created

### Phase 2: ttrpg-gm Enhancement
- [ ] Add SNEQ initialization to SKILL.md
- [ ] Update NPC generation to use superposition
- [ ] Enhance dialogue system with collapse checks
- [ ] Integrate constraint propagation into responses

### Phase 3: Testing
- [ ] Test with Kaori Rhen campaign
- [ ] Verify constraint propagation works
- [ ] Check coherence validation catches contradictions
- [ ] Performance testing (cache hits)

## Prompt Engineering for SNEQ

When LLM generates content, include SNEQ context:

```
SYSTEM PROMPT:
You are the Narrative Motor of a quantum-state narrative system.

CORE PRINCIPLES:
1. RESPECT FIGED FACTS - Facts marked [FIGE] are SACRED and immutable
2. RESPECT STRICT CONSTRAINTS - Constraints marked [STRICT] are MANDATORY
3. MAINTAIN NARRATIVE COHERENCE - Your response must be tonally and logically consistent
4. GENERATE INTERESTING CONTENT - Avoid clichés and generic responses
5. EXPLAIN YOUR REASONING - Show your thought process for validation

CURRENT CONTEXT:
Entity: {{entity.nom}}
Attribute to determine: {{attribute}}
Constraints: {{contraintes}}
Relations: {{relations}}

GENERATION RULES:
{{#each category}}
- {{category}} attributes should be: {{guidelines}}
{{/each}}

OUTPUT FORMAT:
{{jsonSchema}}
```

## Performance Optimizations

### Pre-Generation

Predict and pre-generate likely attributes:

```typescript
// Background worker that anticipates needs
class PredictiveGenerator {
  async pregenerate(playerLocation: string) {
    const npcs = getNPCsInLocation(playerLocation);

    for (const npc of npcs) {
      // Check which attributes are still INDEFINI
      const unpresent = getUnpresentAttributes(npc);

      // Pre-generate likely conversation starters
      if (unpresent.includes('motivation')) {
        await sneq.mc.collapse({
          entiteId: npc.id,
          attribut: 'motivation',
          options: { accepterPartiel: true } // Cache even if not used
        });
      }
    }
  }
}
```

### Semantic Caching

Cache similar generation contexts:

```typescript
// Vector-based cache for semantic similarity
class SemanticCache {
  async check(contexte: ContexteCollapse): CacheEntree | null {
    const embedding = await generateEmbedding(normaliserContexte(contexte));

    // Search for similar contexts
    const similaires = await vectorDB.search(embedding, threshold: 0.85);

    for (const similaire of similaires) {
      if (similaire.similarite >= 0.85) {
        // Adapt the cached value to current context
        return adapterEntree(similaire, contexte);
      }
    }

    return null; // No cache hit
  }
}
```

## Testing Checklist

- [ ] Create test NPCs with superposition
- [ ] Trigger collapse via dialogue
- [ ] Verify constraint propagation
- [ ] Test hidden D20 with SNEQ
- [ ] Validate coherence (try to create contradiction)
- [ ] Performance testing (100+ entities)
- [ ] Cache hit rate > 80%
- [ ] Response latency < 200ms (with cache)

## Example: Full NPC Creation

```typescript
// Complete example: Creating Vex (hollow prophet)

const sneq = new SNEQSystem();

const vex = sneq.createEntity({
  type: 'PERSONNAGE',
  nom: "Vex",
  aliases: ["Subject 77", "the weapon"]
});

// Add identity potentiality
sneq.cp.ajouterContrainte(vex.id, "true_identity", {
  source: { type: 'REGLE_MONDE', regleId: "identity_is_composite" },
  regle: {
    type: 'IMPLIQUE',
    condition: "memories_deleted = true",
    consequence: "fragmentation_trigger = kindness"
  },
  justificationNarrative: "Optimization left gaps"
});

// Add secret potentiality
sneq.cp.ajouterContrainte(vex.id, "secret_principal", {
  source: { type: 'FAIT_CANONIQUE', faitId: "optimization_program" },
  regle: {
    type: 'NE_PEUT_PAS_ETRE',
    valeurs: [{ type: 'STRING', valeur: "helper_of_helix" }]
  },
  justificationNarrative: "Stole data from Helix Dynamics"
});

// Relation to corporation (causal)
const helix = sneq.createEntity({
  type: 'ORGANISATION',
  nom: "Helix Dynamics",
  aliases: ["the Corp", "They"]
});

sneq.createRelation(helix, {
  categorie: 'CAUSAL',
  sous_type: 'A_CAUSE',  // Helix caused Vex's condition
  forcePropagation: 0.9  // Strong influence
});

// When player asks: "Who are you really?"
const collapse = await sneq.observe({
  entiteId: vex.id,
  attribut: "true_identity",
  observation: {
    timestamp: { jour: 1, heure: 1 },
    lieu: "neo_shanghai_undercity",
    methode: { type: 'DIALOGUE', pnjId: vex.id }
  }
});

// Result:
// 1. vex.true_identity = "I am a weapon. Weapons don't feel." (FIGE)
// 2. Secret: "Ghost memories of sister she can't remember" (FIGE)
// 3. New dialogue options: "You seem different when you're kind"
```

## Next Steps

1. **Review types.ts** - Core SNEQ structures implemented
2. **Create example NPCs** - Use integration patterns
3. **Test collapse flow** - Verify fact crystallization
4. **Measure performance** - Cache hit rate, response latency
5. **Iterate on prompt engineering** - Improve LLM coherence

This brings ttrpg-gm from "GM improvises within constraints" to "quantum narrative engine with guaranteed coherence."
