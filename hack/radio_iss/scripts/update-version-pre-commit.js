#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const INDEX_FILE = 'index.html';

try {
  // Check if index.html is being committed
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  
  if (stagedFiles.includes(INDEX_FILE)) {
    console.log('🔄 Auto-updating version comment with latest commit hash...');
    
    // Get the latest commit hash
    const latestCommit = execSync('git log --format="%h" -1', { encoding: 'utf8' }).trim();
    
    // Read the index.html file
    const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
    
    // Update the version comment
    const updatedContent = indexContent.replace(
      /<!-- Version: commit [a-f0-9]{7} - /,
      `<!-- Version: commit ${latestCommit} - `
    );
    
    // Only write if content changed
    if (updatedContent !== indexContent) {
      fs.writeFileSync(INDEX_FILE, updatedContent);
      console.log(`✅ Updated version comment to: ${latestCommit}`);
      
      // Re-add the file to staging
      execSync(`git add ${INDEX_FILE}`);
    } else {
      console.log('ℹ️  Version comment already current or not found');
    }
  }
} catch (error) {
  console.error('Error updating version comment:', error.message);
  // Don't fail the commit, just warn
}

process.exit(0);