import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqgwzzzjlswyagncyhih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZ3d6enpqbHN3eWFnbmN5aGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzAxMTYsImV4cCI6MjA4MDg0NjExNn0.ond9eob2dMo-9m2kZIOGGdP1wprUe_0OtIBWMo4Vypk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Analyzing paper creation patterns...\n');

const { data: papers, error } = await supabase
  .from('papers_from_technical_analysis')
  .select('id, title, analysis_id, metadata, created_at')
  .order('created_at', { ascending: false })
  .limit(50);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Total papers: ${papers.length}\n`);

// Group by domain and time proximity (within 5 minutes = same analysis session)
const groups = [];
let currentGroup = null;

papers.forEach(paper => {
  const domain = paper.metadata?.domain || 'Unknown';
  const timestamp = new Date(paper.created_at);

  // Check if this paper belongs to current group (same domain, within 5 minutes)
  if (currentGroup &&
      currentGroup.domain === domain &&
      (currentGroup.lastTimestamp - timestamp) < 5 * 60 * 1000) {
    currentGroup.papers.push(paper);
    currentGroup.lastTimestamp = timestamp;
  } else {
    // Start new group
    currentGroup = {
      domain,
      papers: [paper],
      firstTimestamp: timestamp,
      lastTimestamp: timestamp
    };
    groups.push(currentGroup);
  }
});

console.log('═══ PAPER GROUPS (by domain and time proximity) ═══\n');

groups.forEach((group, idx) => {
  const duration = (group.firstTimestamp - group.lastTimestamp) / 1000;
  const expectedCount = 5;
  const status = group.papers.length === expectedCount ? '✅' : '⚠️';

  console.log(`${status} Group ${idx + 1}: ${group.domain} (${group.papers.length}/5 papers)`);
  console.log(`   Time: ${group.lastTimestamp.toISOString()}`);
  console.log(`   Duration: ${duration.toFixed(1)}s`);

  group.papers.forEach((paper, pIdx) => {
    const trl = paper.metadata?.trl_level || '?';
    console.log(`   ${pIdx + 1}. [TRL ${trl}] ${paper.title.substring(0, 60)}...`);
  });
  console.log('');
});

console.log('\n═══ SUMMARY ═══');
console.log(`Total groups identified: ${groups.length}`);
console.log(`Groups with exactly 5 papers: ${groups.filter(g => g.papers.length === 5).length} ✅`);
console.log(`Groups with < 5 papers: ${groups.filter(g => g.papers.length < 5).length} ⚠️`);
console.log(`Groups with > 5 papers: ${groups.filter(g => g.papers.length > 5).length} ⚠️`);

console.log('\n═══ CONCLUSION ═══');
if (groups.every(g => g.papers.length === 5)) {
  console.log('✅ Technical Agent IS writing all 5 papers for each analysis');
} else if (groups.every(g => g.papers.length === 1)) {
  console.log('❌ Technical Agent is only writing 1 paper per analysis (should be 5!)');
} else {
  console.log('⚠️  Mixed results - some analyses have all 5 papers, others do not');
}
