import { StudyNote } from '../types';

export const noteToMarkdown = (note: StudyNote): string => {
  let md = `# ${note.title}\n\n`;
  md += `**Subject:** ${note.subject} | **Topic:** ${note.topic} | **Academic Level:** ${note.academicLevel}\n`;
  md += `*Generated on:* ${new Date(note.createdAt).toLocaleDateString()} via StudyGenius AI\n\n`;
  
  md += `## Executive Overview\n${note.overview}\n\n`;

  if (note.definitions && note.definitions.length > 0) {
    md += `## Core Definitions\n`;
    for (const def of note.definitions) {
      md += `- **${def.term}**: ${def.definition}\n`;
    }
    md += `\n`;
  }

  if (note.keyPoints && note.keyPoints.length > 0) {
    md += `## Key Principles & Concepts\n`;
    for (const kp of note.keyPoints) {
      md += `- ${kp}\n`;
    }
    md += `\n`;
  }

  if (note.deepDiveSections && note.deepDiveSections.length > 0) {
    md += `## Deep Dive Analysis\n`;
    for (const sec of note.deepDiveSections) {
      md += `### ${sec.heading}\n${sec.content}\n\n`;
      if (sec.example) {
        md += `> **Concrete Example:** ${sec.example}\n\n`;
      }
    }
  }

  if (note.mnemonicOrMemoryHook) {
    md += `## Memory Hook / Mnemonic\n💡 ${note.mnemonicOrMemoryHook}\n\n`;
  }

  if (note.commonExamMistakes && note.commonExamMistakes.length > 0) {
    md += `## Common Exam Mistakes & Pitfalls\n`;
    for (const mistake of note.commonExamMistakes) {
      md += `⚠️ ${mistake}\n`;
    }
    md += `\n`;
  }

  if (note.summaryTakeaways && note.summaryTakeaways.length > 0) {
    md += `## Rapid-Review Summary\n`;
    for (const st of note.summaryTakeaways) {
      md += `✅ ${st}\n`;
    }
    md += `\n`;
  }

  return md;
};

export const downloadNoteAsMarkdown = (note: StudyNote) => {
  const content = noteToMarkdown(note);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = note.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${sanitizedTitle}_notes.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
