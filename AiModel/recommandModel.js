import * as tf from '@tensorflow/tfjs';

const skillCategories = [
  "JavaScript", "Python", "Java", "C#", "C++", "PHP", "Ruby", "Swift", "Kotlin",
  "TypeScript", "HTML", "CSS", "SQL", "NoSQL", "React", "Angular", "Vue.js",
  "Node.js", "Django", "Flask", "Ruby on Rails", "ASP.NET", "Laravel", "WordPress",
  "Shopify", "Magento", "RESTful APIs", "GraphQL", "UX/UI Design", "Adobe XD",
  "Sketch", "Figma", "Photoshop", "Illustrator", "InVision", "Wireframing",
  "Prototyping", "Responsive Design", "Mobile App Design", "Web Design", "Logo Design",
  "SEO", "SEM", "Google Ads", "Facebook Ads", "Social Media Marketing", "Content Marketing",
  "Email Marketing", "Affiliate Marketing", "PPC Advertising", "Marketing Strategy",
  "Google Analytics", "Conversion Rate Optimization", "Influencer Marketing", "Copywriting",
  "Content Writing", "Technical Writing", "Blogging", "Creative Writing", "Editing",
  "Proofreading", "Ghostwriting", "Resume Writing", "Grant Writing", "Scriptwriting",
  "Product Descriptions", "E-book Writing", "Video Editing", "Animation", "2D Animation",
  "3D Animation", "Motion Graphics", "After Effects", "Premiere Pro", "Final Cut Pro",
  "Video Production", "Explainer Videos", "Whiteboard Animation", "Accounting",
  "Financial Analysis", "Business Planning", "Market Research", "Project Management",
  "Business Development", "Data Analysis", "Excel", "QuickBooks", "Budgeting",
  "Forecasting", "Investment Analysis", "Data Entry", "Research", "Customer Service",
  "Email Management", "Calendar Management", "Personal Assistance", "Lead Generation",
  "Transcription", "Cybersecurity", "Network Administration", "System Administration",
  "IT Support", "Cloud Computing", "AWS", "Azure", "DevOps", "IT Consulting",
  "Database Administration", "Tutoring", "Course Creation", "Language Teaching",
  "Educational Content", "Illustration", "Art Direction", "Photography", "Music Composition",
  "Voice Over", "Sound Design", "3D Modeling", "Game Design", "Legal Writing",
  "Contract Drafting", "Legal Research", "Business Consulting", "HR Consulting",
  "Compliance"
];


const encodeSkills = (skills) => {
    return skillCategories.map(category => skills.includes(category) ? 1 : 0);
  };

  const prepareTrainingData = (users, gigs) => {
    return users.flatMap(user => {
      return gigs.map(gig => {
        const userSkillsVector = encodeSkills(user.skills);
        const gigSkillsVector = encodeSkills(gig.skills);
        return {
          input: [...userSkillsVector, ...gigSkillsVector],
          output: [0]
        };
      });
    });
  };



export const trainRecommendationModel = async (users, gigs) => {
    const trainingData = prepareTrainingData(users, gigs);

    const xs = tf.tensor2d(trainingData.map(item => item.input));

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 100, inputShape: [xs.shape[1]], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 50, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' })); // Output layer with 1 unit

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    await model.fit(xs, tf.tensor2d(trainingData.map(() => [0])), { epochs: 10 });

    console.log("Model trained successfully");
    return model;
  };
