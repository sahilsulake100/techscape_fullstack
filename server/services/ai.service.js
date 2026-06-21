/**
 * AI Teammate Recommendation Service
 * 
 * This service calculates the match score between a team's requirements and a developer's profile.
 * Designed as a modular service so it can be easily upgraded to Vector Embeddings / Semantic Search / RAG later.
 */

/**
 * Calculates recommendation matching score and explanations
 * @param {Object} team - The team requirements
 * @param {Object} developer - The candidate developer profile
 * @returns {Object} { matchScore, matchedSkills, recommendationReason }
 */
const calculateMatch = (team, developer) => {
  const teamSkills = (team.skills_needed || []).map(s => s.toLowerCase().trim());
  const devSkills = (developer.skills || []).map(s => s.toLowerCase().trim());
  const teamRoles = (team.open_roles || []).map(r => r.toLowerCase().trim());
  const devRole = (developer.role || "").toLowerCase().trim();

  // 1. Skill Match (50%)
  let skillScore = 0;
  const matchedSkills = [];

  if (teamSkills.length > 0) {
    const overlapCount = teamSkills.filter(skill => {
      const match = devSkills.includes(skill);
      if (match) {
        // Find original casing
        const originalSkill = developer.skills.find(s => s.toLowerCase().trim() === skill);
        matchedSkills.push(originalSkill || skill);
      }
      return match;
    }).length;
    
    skillScore = (overlapCount / teamSkills.length) * 100;
  } else {
    skillScore = 100; // No requirements, default match
  }

  // 2. Role Match (25%)
  let roleScore = 0;
  if (teamRoles.length > 0) {
    if (teamRoles.includes(devRole)) {
      roleScore = 100;
    } else if (
      // General fullstack compatibility fallback
      (devRole === "fullstack" && (teamRoles.includes("frontend") || teamRoles.includes("backend"))) ||
      (teamRoles.includes("fullstack") && (devRole === "frontend" || devRole === "backend"))
    ) {
      roleScore = 70; // High partial match
    } else {
      roleScore = 0;
    }
  } else {
    roleScore = 100; // Default match
  }

  // 3. Project Relevance (15%)
  let projectScore = 0;
  const devProjects = developer.projects || [];
  const projectKeywords = [...teamSkills, ...teamRoles];
  const teamDescWords = (team.description || "").toLowerCase().split(/\s+/);
  
  // Clean/unique list of keywords to match against developer details
  const searchKeywords = [...new Set([...projectKeywords, ...teamDescWords])].filter(w => w.length > 3);

  if (searchKeywords.length > 0 && (devProjects.length > 0 || developer.bio)) {
    const allDevText = [
      ...devProjects,
      developer.bio || ""
    ].join(" ").toLowerCase();

    const matchedKeywordCount = searchKeywords.filter(keyword => allDevText.includes(keyword)).length;
    
    // Scale matching count (e.g. matching 3+ keywords gives full project score)
    projectScore = Math.min((matchedKeywordCount / 3) * 100, 100);
  } else {
    projectScore = 50; // Neutral fallback
  }

  // 4. Experience Level (10%)
  let experienceScore = 50; // Default intermediate
  const teamDesc = (team.description || "").toLowerCase();
  const devExp = (developer.experience_level || "intermediate").toLowerCase().trim();

  const expectsAdvanced = teamDesc.includes("advanced") || teamDesc.includes("expert") || teamDesc.includes("senior") || teamDesc.includes("heavy production");
  const expectsBeginner = teamDesc.includes("beginner") || teamDesc.includes("learning") || teamDesc.includes("starter") || teamDesc.includes("junior");

  if (expectsAdvanced) {
    if (devExp === "advanced") experienceScore = 100;
    else if (devExp === "intermediate") experienceScore = 60;
    else experienceScore = 20;
  } else if (expectsBeginner) {
    if (devExp === "beginner") experienceScore = 100;
    else if (devExp === "intermediate") experienceScore = 70;
    else experienceScore = 40; // Overqualified
  } else {
    // Expects standard intermediate
    if (devExp === "intermediate") experienceScore = 100;
    else experienceScore = 80; // Either beginner or advanced is fine
  }

  // 5. Total Match Score Calculation
  const totalScore = Math.round(
    (skillScore * 0.50) +
    (roleScore * 0.25) +
    (projectScore * 0.15) +
    (experienceScore * 0.10)
  );

  // 6. Explanation Generation
  const readableRole = developer.role ? developer.role.toUpperCase() : "developer";
  let explanation = "";

  if (matchedSkills.length > 0) {
    explanation += `This developer matches ${matchedSkills.length} of the ${team.skills_needed.length} required skills including ${matchedSkills.slice(0, 3).join(", ")}${matchedSkills.length > 3 ? " and others" : ""}. `;
  } else {
    explanation += `This developer is strong in their skills stack. `;
  }

  if (roleScore === 100) {
    explanation += `They fit the exact requested role of ${readableRole}. `;
  } else if (roleScore > 0) {
    explanation += `Their role as a ${readableRole} offers strong partial compatibility with your required setup. `;
  }

  if (projectScore > 60) {
    explanation += `Their bio and projects are highly relevant to your team project details. `;
  }

  if (experienceScore === 100) {
    explanation += `Their ${devExp} experience matches the team's project complexity perfectly.`;
  } else if (devExp === "advanced" && expectsBeginner) {
    explanation += `They bring advanced experience to your team.`;
  }

  return {
    matchScore: Math.max(0, Math.min(100, totalScore)),
    matchedSkills,
    recommendationReason: explanation.trim()
  };
};

module.exports = {
  calculateMatch
};
