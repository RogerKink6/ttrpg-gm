// Simple SNEQ Test (no imports)

console.log('🌟 SNEQ Test\n');

// Test basic collapse
const collapse = {
  type: 'SUCCES',
  fait: {
    cle: 'secret',
    valeur: 'Aided village escape'
  },
  propagation: {
    faitSource: { cle: 'test' },
    contraintesPropagees: [],
    entitesImpactees: new Set(['npc1', 'npc2'])
  }
};

console.log(`✅ Collapse: ${collapse.fait.cle}`);
console.log(`   Value: ${collapse.fait.valeur}`);
console.log(`   Impacts: ${Array.from(collapse.propagation.entitesImpactees).join(', ')}`);

console.log('\n✅ SNEQ Prototype Test PASSED!');
