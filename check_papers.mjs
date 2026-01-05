import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqgwzzzjlswyagncyhih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZ3d6enpqbHN3eWFnbmN5aGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzAxMTYsImV4cCI6MjA4MDg0NjExNn0.ond9eob2dMo-9m2kZIOGGdP1wprUe_0OtIBWMo4Vypk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Checking papers_from_technical_analysis table...\n');

// Get all papers
const { data: papers, error } = await supabase
  .from('papers_from_technical_analysis')
  .select('id, title, analysis_id, relevance_score, is_published_to_marketplace, metadata, created_at')
  .order('created_at', { ascending: false })
  .limit(20);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Total papers found: ${papers.length}\n`);

// Group by analysis_id
const byAnalysis = papers.reduce((acc, paper) => {
  const analysisId = paper.analysis_id || 'NULL';
  if (!acc[analysisId]) acc[analysisId] = [];
  acc[analysisId].push(paper);
  return acc;
}, {});

console.log('Papers grouped by analysis_id:\n');
for (const [analysisId, analysisPapers] of Object.entries(byAnalysis)) {
  console.log(`\n═══ Analysis ID: ${analysisId} (${analysisPapers.length} papers) ═══`);

  analysisPapers.forEach((paper, idx) => {
    console.log(`\n  ${idx + 1}. ${paper.title}`);
    console.log(`     ID: ${paper.id}`);
    console.log(`     Relevance Score: ${paper.relevance_score || 'NULL'}`);
    console.log(`     Published to Marketplace: ${paper.is_published_to_marketplace}`);
    console.log(`     Metadata: ${paper.metadata ? JSON.stringify(paper.metadata).substring(0, 100) : 'NULL'}...`);
    console.log(`     Created: ${paper.created_at}`);
  });
}

console.log('\n\n=== SUMMARY ===');
console.log(`Total analyses: ${Object.keys(byAnalysis).length}`);
for (const [analysisId, analysisPapers] of Object.entries(byAnalysis)) {
  const hasAllFields = analysisPapers.every(p => p.analysis_id && p.relevance_score !== null);
  console.log(`  ${analysisId}: ${analysisPapers.length} papers ${hasAllFields ? '✅' : '⚠️  Missing fields'}`);
}
