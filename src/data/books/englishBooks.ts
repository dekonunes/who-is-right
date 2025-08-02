import { BookRecommendation } from "./index";

export const englishBooksByType: Record<string, BookRecommendation[]> = {
  couple: [
    {
      id: "1",
      title: "The 5 Love Languages",
      author: "Gary Chapman",
      description:
        "Learn how to express and receive love in ways that strengthen your relationship.",
      category: "Marriage",
      asin: "B00OICLVNQ",
      link: "https://amzn.to/4lEk0Wq",
    },
    {
      id: "2",
      title: "The Seven Principles for Making Marriage Work",
      author: "John Gottman",
      description:
        "Science-based strategies to build a lasting, happy relationship.",
      category: "Marriage",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/40uScvi",
    },
    {
      id: "3",
      title: "Boundaries in Marriage",
      author: "Henry Cloud",
      description:
        "Establish healthy boundaries to create a stronger, more loving marriage.",
      category: "Marriage",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4oiWal9",
    },
    {
      id: "4",
      title: "Hold Me Tight",
      author: "Sue Johnson",
      description:
        "Seven conversations for a lifetime of love and emotional connection.",
      category: "Marriage",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4lDFT8o",
    },
  ],
  friends: [
    {
      id: "1",
      title: "Crucial Conversations",
      author: "Kerry Patterson",
      description:
        "Master the skills to handle high-stakes conversations and resolve conflicts effectively.",
      category: "Friendship",
      asin: "B005K0AYH4",
      link: "https://amzn.to/3GVNVuh",
    },
    {
      id: "2",
      title: "The Friendship Factor",
      author: "Alan Loy McGinnis",
      description:
        "How to get closer to the people you care for and help them get closer to you.",
      category: "Friendship",
      asin: "B005K0AYH4",
      link: "https://amzn.to/46UZL2k",
    },
    {
      id: "3",
      title: "Boundaries in Relationships",
      author: "Henry Cloud",
      description:
        "Learn when to say yes and how to say no to take control of your life.",
      category: "Friendship",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4nZf14h",
    },
    {
      id: "4",
      title: "The Art of Friendship",
      author: "Kim Wier",
      description: "70 simple rules for making meaningful connections.",
      category: "Friendship",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/4o9hSYI",
    },
  ],
  mom_and_child: [
    {
      id: "1",
      title: "How to Talk So Kids Will Listen",
      author: "Adele Faber",
      description:
        "Learn effective communication techniques for better parent-child relationships.",
      category: "Parenting",
      asin: "B00OICLVNQ",
      link: "https://amzn.to/3GZjSSt",
    },
    {
      id: "2",
      title: "The Whole-Brain Child",
      author: "Daniel Siegel",
      description:
        "12 revolutionary strategies to nurture your child's developing mind.",
      category: "Parenting",
      asin: "B005K0AYH4",
      link: "https://amzn.to/4kZFj3Q",
    },
    {
      id: "3",
      title: "Parenting with Love and Logic",
      author: "Foster Cline",
      description:
        "Teaching children responsibility and building strong relationships.",
      category: "Parenting",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4m73ZrV",
    },
    {
      id: "4",
      title: "No-Drama Discipline",
      author: "Daniel Siegel",
      description:
        "The whole-brain way to calm the chaos and nurture your child's developing mind.",
      category: "Parenting",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/4m68Fyd",
    },
  ],
  siblings: [
    {
      id: "1",
      title: "3pcs Best Friends Brothers Sisters Gifts Key",
      author: "Gift",
      description:
        "Unique design fashion jewelry gift for best friends sisters brothers!",
      category: "Siblings",
      asin: "B001FA0KQK",
      link: "https://amzn.to/46WoBPg",
    },
    {
      id: "2",
      title: "Siblings Without Rivalry",
      author: "Adele Faber",
      description:
        "How to help your children live together so you can live too.",
      category: "Siblings",
      asin: "B00OICLVNQ",
      link: "https://amzn.to/45bjmci",
    },
    {
      id: "3",
      title: "The Birth Order Book",
      author: "Kevin Leman",
      description:
        "Why you are the way you are and how to understand your siblings better.",
      category: "Siblings",
      asin: "B005K0AYH4",
      link: "https://amzn.to/3GPffdH",
    },
    {
      id: "4",
      title: "The Sibling Effect",
      author: "Jeffrey Kluger",
      description: "What the bonds among brothers and sisters reveal about us.",
      category: "Siblings",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/44MY5qm",
    },
  ],
  co_workers: [
    {
      id: "1",
      title: "Crucial Conversations",
      author: "Kerry Patterson",
      description:
        "Master the skills to handle high-stakes conversations and resolve conflicts effectively.",
      category: "Workplace",
      asin: "B005K0AYH4",
      link: "https://amzn.to/3GVNVuh",
    },
    {
      id: "2",
      title: "Difficult Conversations",
      author: "Douglas Stone",
      description: "How to discuss what matters most in work and life.",
      category: "Workplace",
      asin: "B00OICLVNQ",
      link: "https://amzn.to/4lEk0Wq",
    },
    {
      id: "3",
      title: "The No Asshole Rule",
      author: "Robert Sutton",
      description:
        "Building a civilized workplace and surviving one that isn't.",
      category: "Workplace",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4oiWal9",
    },
    {
      id: "4",
      title: "Getting to Yes",
      author: "Roger Fisher",
      description: "Negotiating agreement without giving in.",
      category: "Workplace",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/40uScvi",
    },
  ],
  boss_and_employee: [
    {
      id: "1",
      title: "The One Minute Manager",
      author: "Ken Blanchard",
      description:
        "The world's most popular management method for increasing productivity.",
      category: "Leadership",
      asin: "B00OICLVNQ",
      link: "https://amzn.to/4lEk0Wq",
    },
    {
      id: "2",
      title: "First, Break All the Rules",
      author: "Marcus Buckingham",
      description: "What the world's greatest managers do differently.",
      category: "Leadership",
      asin: "B005K0AYH4",
      link: "https://amzn.to/3GVNVuh",
    },
    {
      id: "3",
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen Covey",
      description: "Powerful lessons in personal change for workplace success.",
      category: "Leadership",
      asin: "B001FA0KQK",
      link: "https://amzn.to/4oiWal9",
    },
    {
      id: "4",
      title: "Drive",
      author: "Daniel Pink",
      description:
        "The surprising truth about what motivates us in work and life.",
      category: "Leadership",
      asin: "B00B0Z9Q8Y",
      link: "https://amzn.to/40uScvi",
    },
  ],
};
