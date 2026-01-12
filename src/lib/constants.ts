export enum StudyDifficulty {
  INTRO = 'Introductory',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum StudyLength {
  SHORT = 'Brief',
  MEDIUM = 'Standard',
  LONG = 'Exhaustive'
}

export enum UserTier {
  SEEKER = 'seeker',
  SCRIBE = 'scribe'
}

export const SECTION_DEFINITIONS = [
  { sectionId: 'theme_summary', title: 'Thematic Overview' },
  { sectionId: 'historical_context', title: 'Historical & Cultural Context' },
  { sectionId: 'original_language_analysis', title: 'Original Language Nuances' },
  { sectionId: 'literary_structure', title: 'Literary Structure' },
  { sectionId: 'verse_by_verse', title: 'Verse-by-Verse Exegesis' },
  { sectionId: 'cross_references', title: 'Biblical Cross-References' },
  { sectionId: 'theological_synthesis', title: 'Theological Synthesis' },
  { sectionId: 'practical_application', title: 'Modern Application' },
  { sectionId: 'devotional_reflection', title: 'Devotional Reflection' },
  { sectionId: 'prayer_guide', title: 'Guided Prayer' },
  { sectionId: 'further_study', title: 'Further Study Questions' },
  { sectionId: 'theological_quiz', title: 'Theological Quiz' }
];

export const FEATURED_STUDIES = [
  {
    theme: "The Prodigal Son",
    title: "The Heart of the Father",
    passages: "Luke 15:11-32",
    difficulty: StudyDifficulty.INTRO,
    length: StudyLength.SHORT,
    image: "https://images.unsplash.com/photo-1507692049790-de58293a4697?q=80&w=2940&auto=format&fit=crop"
  },
  {
    theme: "Suffering & Sovereignty",
    title: "The Trial of Job",
    passages: "Job 1-3, 38-42",
    difficulty: StudyDifficulty.ADVANCED,
    length: StudyLength.LONG, // Note: Prototype mapped this to LONG usually
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=2940&auto=format&fit=crop"
  },
  {
    theme: "Christological Hymn",
    title: "Supremacy of Christ",
    passages: "Colossians 1:15-20",
    difficulty: StudyDifficulty.INTERMEDIATE,
    length: StudyLength.MEDIUM,
    image: "https://images.unsplash.com/photo-1437603568260-1950d3ca6eab?q=80&w=2940&auto=format&fit=crop"
  }
];

// Fix for Extended vs Long type mismatch if needed.
// For now updated Feature Study 2 to use constant if available or string.
