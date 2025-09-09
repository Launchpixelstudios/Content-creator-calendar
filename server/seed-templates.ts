import { db } from "./db";
import { contentTemplates } from "@shared/schema";

const solopreneurTemplates = [
  // Marketing Posts - Free
  {
    title: "Personal Story Share",
    description: "Share a personal journey or lesson learned",
    content: "When I started my business, I thought [specific challenge]. Here's what I learned: [lesson]. If you're facing something similar, remember that [encouraging message]. What's one lesson you've learned recently?",
    platform: "social",
    category: "marketing",
    isPremium: false,
  },
  {
    title: "Behind the Scenes",
    description: "Show the reality of running your business",
    content: "Currently working on [project/task] and it's [honest feeling]. The reality of solopreneurship isn't always glamorous, but moments like these remind me why I love what I do. What are you working on today?",
    platform: "social",
    category: "marketing",
    isPremium: false,
  },
  {
    title: "Quick Tip Monday",
    description: "Share actionable business advice",
    content: "Monday Tip: [Specific actionable tip]. This simple change helped me [specific result]. Try it and let me know how it works for you! 💡",
    platform: "social",
    category: "educational",
    isPremium: false,
  },
  
  // Email Templates - Premium
  {
    title: "Weekly Value Newsletter",
    description: "Weekly newsletter providing value to subscribers",
    content: "Subject: Your weekly dose of [your expertise area] insights\n\nHi [First Name],\n\nThis week I've been thinking about [relevant topic]. Here are 3 key insights:\n\n1. [Insight 1 with explanation]\n2. [Insight 2 with explanation]  \n3. [Insight 3 with explanation]\n\nQuick win for this week: [Actionable tip]\n\nReply and let me know which resonated most with you!\n\nBest,\n[Your name]",
    platform: "email",
    category: "educational",
    isPremium: true,
  },
  {
    title: "Product Launch Announcement",
    description: "Announce new product or service to email list",
    content: "Subject: Something exciting is here! 🎉\n\nHi [First Name],\n\nAfter months of work, I'm thrilled to announce [Product Name]!\n\nThis [product type] helps [target audience] [main benefit]. \n\nI created this because I noticed [problem you observed]. \n\nHere's what you'll get:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nEarly bird special: [Offer details]\n\n[Call to Action Button]\n\nQuestions? Just reply to this email.\n\n[Your name]",
    platform: "email",
    category: "promotional",
    isPremium: true,
  },
  
  // Blog Posts - Premium  
  {
    title: "How-To Guide",
    description: "Step-by-step tutorial in your expertise area",
    content: "# How to [Achieve Specific Result] in [Timeframe]\n\n[Engaging hook about the problem]\n\n## Why This Matters\n[Explain the importance and impact]\n\n## Step 1: [Action Step]\n[Detailed explanation with examples]\n\n## Step 2: [Action Step]\n[Detailed explanation with examples]\n\n## Step 3: [Action Step]\n[Detailed explanation with examples]\n\n## Common Mistakes to Avoid\n• [Mistake 1]\n• [Mistake 2]\n• [Mistake 3]\n\n## Next Steps\n[Clear call-to-action for readers]\n\nWhat questions do you have about [topic]? Let me know in the comments!",
    platform: "blog",
    category: "educational",
    isPremium: true,
  },
  {
    title: "Case Study Post",
    description: "Share client success story or your own results",
    content: "# How [Client/I] Achieved [Specific Result] in [Timeframe]\n\n## The Challenge\n[Describe the initial situation and problems]\n\n## The Strategy\nHere's exactly what we did:\n\n### Phase 1: [Strategy Component]\n[Specific actions taken]\n\n### Phase 2: [Strategy Component]\n[Specific actions taken]\n\n### Phase 3: [Strategy Component]\n[Specific actions taken]\n\n## The Results\n• [Specific metric/result 1]\n• [Specific metric/result 2]\n• [Specific metric/result 3]\n\n## Key Takeaways\n1. [Lesson learned]\n2. [Lesson learned]\n3. [Lesson learned]\n\n## Want Similar Results?\n[Call-to-action for your services/products]\n\nWhat's your biggest challenge with [relevant topic]?",
    platform: "blog",
    category: "marketing",
    isPremium: true,
  },
  
  // Social Media - More Templates
  {
    title: "Question Engagement Post",
    description: "Ask audience questions to boost engagement",
    content: "Here's something I'm curious about: [Relevant question related to your niche]?\n\nI've found that [your perspective/experience], but I'd love to hear different viewpoints.\n\nDrop your thoughts below! 👇",
    platform: "social",
    category: "marketing",
    isPremium: false,
  },
  {
    title: "Myth-Busting Post",
    description: "Address common misconceptions in your industry",
    content: "Myth: [Common misconception in your industry]\n\nReality: [The actual truth]\n\nThis misconception leads to [negative consequence]. Instead, try [better approach].\n\nWhat other myths have you heard about [your industry]? 🤔",
    platform: "social",
    category: "educational",
    isPremium: true,
  },
  {
    title: "Tool Recommendation",
    description: "Share useful tools or resources",
    content: "Tool Tuesday: [Tool Name] 🛠️\n\nWhat it does: [Brief description]\nWhy I love it: [Specific benefits]\nBest for: [Target user/use case]\nPrice: [Pricing info]\n\nThis has saved me [time/money/effort amount]. Worth checking out if you're looking to [solve specific problem].\n\n[Link] (not sponsored, just genuinely useful!)",
    platform: "social",
    category: "educational",
    isPremium: true,
  }
];

export async function seedContentTemplates() {
  console.log("Seeding content templates...");
  
  try {
    for (const template of solopreneurTemplates) {
      await db.insert(contentTemplates).values(template);
    }
    console.log(`Successfully seeded ${solopreneurTemplates.length} content templates!`);
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}

// Run the seeding function
seedContentTemplates().then(() => process.exit(0));