#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const INDEX_FILE = 'index.html';

console.log('🔄 Auto-updating version comment with latest commit hash...');

try {
  // Get the latest commit hash
  const latestCommit = execSync('git log --format="%h" -1', { encoding: 'utf8' }).trim();
  
  // Read the index.html file
  if (!fs.existsSync(INDEX_FILE)) {
    console.log(`❌ ${INDEX_FILE} not found`);
    process.exit(0);
  }
  
  const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
  
  // Check if version comment exists
  if (!indexContent.includes('<!-- Version: commit')) {
    console.log('ℹ️  No version comment found, skipping update');
    process.exit(0);
  }
  
  // Update the version comment
  const updatedContent = indexContent.replace(
    /<!-- Version: commit [a-f0-9]{7} - /,
    `<!-- Version: commit ${latestCommit} - `
  );
  
  // Only write if content changed
  if (updatedContent !== indexContent) {
    fs.writeFileSync(INDEX_FILE, updatedContent);
    console.log(`✅ Updated version comment to: ${latestCommit}`);
    
    // Re-add the file to staging if we're in a pre-commit context
    try {
      execSync(`git add ${INDEX_FILE}`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore git add errors in case we're not in a git context
    }
  } else {
    console.log(`ℹ️  Version comment already current (${latestCommit})`);
  }
} catch (error) {
  console.error('❌ Error updating version comment:', error.message);
}

process.exit(0);