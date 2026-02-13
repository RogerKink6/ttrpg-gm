"use strict";
// SNEQ Prototype Test
// Demonstrating superposition narrative with collapse
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../core/types");
async function testSNEQCollapse() {
    console.log('🌟 SNEQ Prototype Test - Superposition Narrative\n');
    // Initialize system
    const sneq = new types_1.SNEQSystem();
    // ==================== CREATE TEST NPC ====================
    const forgeron = sneq.createEntity({
        type: 'PERSONNAGE',
        nom: "Aldric Fervent",
        aliases: ["le forgeron", "le vieux grincheux"]
    });
    console.log(`✓ Created entity: ${forgeron.nom} (${forgeron.id})`);
    console.log(`  Aliases: ${forgeron.aliases.join(', ')}`);
    // ==================== ADD POTENTIALITIES ====================
    // Profession (constrained by world rule)
    sneq.addConstraint(forgeron.id, "profession", {
        id: "ctr_profession",
        source: { type: 'REGLE_MONDE', regleId: "village_blacksmith" },
        dateCreation: { jour: 1, heure: 14 },
        regle: {
            type: 'DOIT_ETRE',
            valeurs: [
                { type: 'STRING', valeur: "forgeron" },
                { type: 'STRING', valeur: "armurier" }
            ]
        },
        justificationNarrative: "Village needs blacksmith"
    });
    console.log(`✓ Added CONSTRAINT: profession ∈ {forgeron, armurier}`);
    // Past military (constrained by inference)
    const armurier = sneq.createEntity({
        type: 'PERSONNAGE',
        nom: "Marcus",
        aliases: ["l'armurier"]
    });
    sneq.createRelation({
        source: forgeron.id,
        cible: armurier.id,
        typeRelation: { categorie: 'SOCIAL', sous_type: 'AMITIE' },
        forcePropagation: 0.7
    });
    sneq.addConstraint(forgeron.id, "passe_militaire", {
        id: "ctr_militaire",
        source: { type: 'RELATION', relationId: `${forgeron.id}_marcus` },
        dateCreation: { jour: 1, heure: 14 },
        regle: {
            type: 'CORRELE_AVEC',
            autreEntite: armurier.id,
            autreAttribut: "secret_principal"
        },
        justificationNarrative: "Friendship with armurier suggests military past"
    });
    console.log(`✓ Added CONSTRAINT: passe_militaire related to Marcus's secret`);
    // Secret (unconstrained - pure potential)
    sneq.addConstraint(forgeron.id, "secret_principal", {
        id: "ctr_secret",
        source: { type: 'INFERENCE_IA', confidence: 0.6 },
        dateCreation: { jour: 1, heure: 14 },
        regle: {
            type: 'CUSTOM',
            evaluateur: "must_be_dramatic && must_be_guilty"
        },
        justificationNarrative: "Old soldiers often have secrets"
    });
    console.log(`✓ Added TENDENCY: secret_principal (guilty + dramatic)`);
    // ==================== FIRST COLLAPSE ====================
    console.log('\n▶ PLAYER: "Tell me about your past"\n');
    const collapse1 = await sneq.observe({
        entiteId: forgeron.id,
        attribut: "passe_militaire",
        observation: {
            timestamp: { jour: 3, heure: 20 },
            lieu: "taverne_village",
            methode: { type: 'DIALOGUE', pnjId: forgeron.id, ligneDialogue: "I served under the Duke" }
        },
        options: {
            profondeur: 'DETAILLEE',
            registre: 'DRAMATIQUE'
        }
    });
    if (collapse1.type === 'SUCCES') {
        console.log(`\n✅ COLLAPSE: passe_militaire`);
        console.log(`   Value: "${collapse1.fait.valeur}"`);
        console.log(`   State: FIGE (immutable)`);
        if (collapse1.propagation) {
            console.log(`\n📊 PROPAGATION to ${collapse1.propagation.entitesImpactees.size} entities:`);
            collapse1.propagation.contraintesPropagees.forEach(c => {
                console.log(`   → ${c.entiteCible}.${c.attributCible}`);
                console.log(`     Constraint: ${c.contrainte.justificationNarrative}`);
            });
        }
    }
    // ==================== SECOND COLLAPSE (secret) ====================
    console.log('\n▶ PLAYER: "What are you hiding?"\n');
    const collapse2 = await sneq.observe({
        entiteId: forgeron.id,
        attribut: "secret_principal",
        observation: {
            timestamp: { jour: 3, heure: 21 },
            lieu: "taverne_village",
            methode: { type: 'DIALOGUE', pnjId: forgeron.id, ligneDialogue: "I helped them escape..." }
        },
        options: {
            profondeur: 'DETAILLEE',
            registre: 'SOMBRE'
        }
    });
    if (collapse2.type === 'SUCCES') {
        console.log(`\n✅ COLLAPSE: secret_principal`);
        console.log(`   Value: "${collapse2.fait.valeur}"`);
        console.log(`   State: FIGE (immutable)`);
        // Show how this changes future dialogue options
        console.log(`\n💡 NEW DIALOGUE OPTIONS EMERGED:`);
        console.log(`   → "Why did you help them escape?" (now valid)`);
        console.log(`   → "Do you regret it?" (now valid)`);
        console.log(`   → "Are you still loyal to the Duke?" (CONTRAINT)`);
    }
    // ==================== EXPORT STATE ====================
    console.log('\n📊 SNEQ SYSTEM STATE:');
    const state = sneq.exportState();
    console.log(`\nRegistre Canonique (immutable facts):`);
    const rcKeys = Object.keys(state.rc);
    console.log(`  Entities: ${rcKeys.length}`);
    let totalFacts = 0;
    for (const key of rcKeys) {
        const entity = state.rc[key];
        totalFacts += Object.keys(entity).length;
    }
    console.log(`  Total Facts: ${totalFacts}`);
    console.log(`\nChamp de Potentialités (unobserved):`);
    const cpKeys = Object.keys(state.cp);
    console.log(`  Entities: ${cpKeys.length}`);
    let totalAttrs = 0;
    for (const key of cpKeys) {
        const entity = state.cp[key];
        totalAttrs += Object.keys(entity).length;
    }
    console.log(`  Total Attributes: ${totalAttrs}`);
    console.log(`\nGraphe de Cohérence (relations):`);
    console.log(`  Nodes: ${state.gcn.noeuds.length}`);
    console.log(`  Edges: ${state.gcn.aretes.length}`);
    console.log('\n✅ SNEQ PROTOTYPE COMPLETE');
}
// Run test
testSNEQCollapse().catch(console.error);
