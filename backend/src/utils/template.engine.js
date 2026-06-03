const TEMPLATES = {
  EMAIL: {
    WELCOME_PRACTITIONER: {
      subject: "Welcome to Lifed Healthmate — Dr. [Name]",
      body: "Hi Dr. [Name],\n\nWelcome to Lifed! We are thrilled to partner with you as a Practitioner. We are currently in the [Phase] phase of your onboarding.\n\nOur team is working diligently to verify your credentials. If you have any questions, please reach out to me.\n\nBest regards,\n[Your Name]\nThe Lifed Team"
    },
    WELCOME_PARTNER: {
      subject: "Partner Onboarding Welcoming — [Name]",
      body: "Hi [Name],\n\nThank you for registering your health centre/organization with Lifed. We are preparing your setup in our platform. Current onboarding stage: [Phase].\n\nAccess your dashboard at: [DASHBOARD_LINK]\n\nBest regards,\n[Your Name]"
    },
    DAY_3_FOLLOWUP: {
      subject: "Onboarding Update & Actions Required — [Name]",
      body: "Hi [Name],\n\nThis is a quick follow-up regarding your onboarding dashboard. We notice you are in the [Phase] phase. Please ensure all mandatory registration tasks are completed.\n\nDashboard: [DASHBOARD_LINK]\n\nWarmly,\n[Your Name]"
    },
    GO_LIVE_NOTICE: {
      subject: "🎉 You are officially LIVE on Lifed Healthmate!",
      body: "Hi [Name],\n\nCongratulations! Your onboarding reviews are complete, and you are officially LIVE on Lifed Healthmate! Patients can now discover and book your services.\n\nSee your live listing: [DASHBOARD_LINK]\n\nCheers,\n[Your Name]\nThe Lifed Team"
    }
  },
  WHATSAPP: {
    WELCOME_PRACTITIONER: "Hi Dr. [Name], welcome to Lifed! We are starting your setup in the [Phase] phase. Let's get you ready. - [Your Name]",
    WELCOME_PARTNER: "Hello [Name]! Thanks for partnering with Lifed. We are building your profile. Current phase: [Phase]. - [Your Name]",
    DAY_3_FOLLOWUP: "Hi [Name], quick update on your onboarding! We are in [Phase] phase. Please complete any outstanding tasks. - [Your Name]",
    GO_LIVE_NOTICE: "🎉 Congrats [Name]! You are officially LIVE on Lifed Healthmate! Patients can now discover your services. - [Your Name]"
  }
};

/**
 * Hydrates standard message templates with data from the database.
 * Replaces tags like [Name], [Your Name], [Phase], [Category], [DASHBOARD_LINK].
 */
function hydrateTemplate(templateString, healthmate, opsUser) {
  if (!templateString) return "";
  
  const name = healthmate.contactName || healthmate.name;
  const opsName = opsUser?.name || "The Lifed Team";
  const phaseFormatted = healthmate.phase.replace("_", " ");
  const dashboardLink = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  return templateString
    .replace(/\[Name\]/g, name)
    .replace(/\[Your Name\]/g, opsName)
    .replace(/\[Phase\]/g, phaseFormatted)
    .replace(/\[Category\]/g, healthmate.category)
    .replace(/\[DASHBOARD_LINK\]/g, dashboardLink);
}

/**
 * Selects the template based on phase and type.
 */
function getTemplateKey(phase, type) {
  if (phase === "PRE_QUALIFY" || phase === "PREPARE") {
    return type === "PRACTITIONER" ? "WELCOME_PRACTITIONER" : "WELCOME_PARTNER";
  }
  if (phase === "REGISTER" || phase === "REVIEW") {
    return "DAY_3_FOLLOWUP";
  }
  if (phase === "LIVE") {
    return "GO_LIVE_NOTICE";
  }
  return "DAY_3_FOLLOWUP";
}

module.exports = {
  TEMPLATES,
  hydrateTemplate,
  getTemplateKey
};
