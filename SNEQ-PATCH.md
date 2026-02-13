# SNEQ-Enhanced TTRPG-GM Character Creation Patch

## Critical Updates to SKILL.md

### Replace Line 370: "## Character Creation" with:

```
## Character Creation

### SNEQ-Enhanced Character Creation

**IMPORTANT:**
- **Player characters** (like Kaori Rhen) start with **established canon facts** (FIGE state)
- **NPCs** start in **superposition** (INDEFINI state - unobserved potential)

**Player Character Example (Kaori Rhen):**
- ✅ **Name:** Kaori Rhen (FIGE - canon fact from backstory)
- ✅ **Age:** 28 (FIGE)
- ✅ **Role:** Augmented private detective (FIGE)
- ✅ **Stack:** Latest-gen cortical stack (FIGE)
- ✅ **Sleeve:** Enhanced female body (FIGE)
- ✅ **Background:** Tragic past - sister died during sleeve dissociation (FIGE - canon fact)
- ✅ **Skills:** Investigation, combat, neural hacking (FIGE)

**For new NPCs:** Use superposition (attributes are INDEFINI until observed)

**NPC Example:**
```javascript
// Create NPC entity with SNEQ
const npc = sneq.createEntity({
  type: 'PERSONNAGE',
  nom: "Kira Chen",
  aliases: ["the netrunner", "glitch"]
});

// Add hidden torment (unobserved until player asks)
sneq.cp.ajouterContrainte(npc.id, "hidden_torment", {
  source: { type: 'REGLE_MONDE', regleId: "dark_past" },
  regle: { type: 'CUSTOM', evaluateur: "must_be_tragic" },
  justificationNarrative: "Haunted by corporate experimentation"
});

// Add secret motivation (propagates to dialogue choices)
sneq.cp.ajouterContrainte(npc.id, "true_motivation", {
  source: { type: 'INFERENCE_IA', confidence: 0.7 },
  regle: { type: 'CUSTOM', evaluateur: "hidden_agenda" },
  justificationNarrative: "Not just a mercenaire"
});
```

**Superposition creates infinite replayability:**
- Same NPC can have different hidden torments across playthroughs
- Player observations crystallize attributes uniquely each time

**Starting Rule:** Player begins ALONE.

All companions must be:
- Found in the world
- Earned through actions
- Hired or recruited

**NPC Agency Rules:**
Every companion has:
- Hidden torments/secrets
- Personal kinks/preferences (for adult content)
- Moral codes they won't break
- Autonomy to argue with player and each other
- Lives beyond player

**Critical:** NPCs are NOT "player-sexual." They must be won according to their specific persona.
```

## Additional Patches Needed

### 1. Fix SNEQ Integration Section
The current section has instruction `import { SNEQSystem } from './sneq/core/types';` but should explain:

```typescript
// At skill load time (for ttrpg-gm skill context, not literal code)
const sneq = new SNEQSystem();

// System is now ready for superposition narrative
```

### 2. Add SNEQ Operation Instructions

**CRITICAL:** SNEQ must operate **silently** in background. Only show narrative results to player.

```markdown
## SNEQ Operation Rules

**For GM (you):**
- SNEQ system runs silently in background
- Only present narrative results to player
- Never show `console.log()` or technical logs
- Player sees story, not system internals
- **State tracking happens invisibly**

**What Player Sees:**
- Narrative descriptions
- Dialogue with NPC responses
- Collapse results (new facts revealed)
- Consequences (world changes, relationship shifts)
- New dialogue options emerging from constraints

**What Player NEVER Sees:**
- SNEQ class instantiations
- Registry Canonique data structures
- Propagation calculations
- Constraint validation messages
- Technical error logs

**Example:**
```
❌ WRONG (showing internals):
const resultat = await sneq.observe(demande);
console.log(`✅ COLLAPSE: ${resultat.fait.valeur}`);
console.log(`📊 PROPAGATION: ${resultat.propagation.contraintesPropagees.length}`);

✅ CORRECT (showing narrative only):
const resultat = await sneq.observe(demande);

// Only present narrative to player
return {
  feedback: "Viktor's past crystallizes: 'Capitaine dans l'armée du Duc. Massacre de Valmure.'",
  newFacts: ["viktor.passe_militaire = true"],
  newConstraints: ["armurier.opinion = knows military past"],
  nextOptions: [
    "Pourquoi as-tu quitté l'armée ?",
    "Que s'est-il passé au massacre de Valmure ?"
  ]
};
```

### 3. Update Example to Use Established Facts

Change examples from INDEFINI to using Kaori's established backstory:

```markdown
**Example (Kaori Rhen - Established Canon):**
- ✅ **Name:** Kaori Rhen (FIGE - canon fact from backstory)
- ✅ **Age:** 28 (FIGE)
- ✅ **Role:** Augmented private detective (FIGE)
- ✅ **Stack:** Latest-gen cortical stack (FIGE)
- ✅ **Sleeve:** Enhanced female body (FIGE)
- ✅ **Background:** Tragic past - sister died during sleeve dissociation (FIGE - canon fact)
- ✅ **Skills:** Investigation, combat, neural hacking (FIGE)
```

## Summary

These patches fix:
1. ✅ Characters start with established facts (not INDEFINI)
2. ✅ SNEQ operates silently (no visible logs to player)
3. ✅ Clear examples of proper character creation
4. ✅ Player sees narrative, not system internals
