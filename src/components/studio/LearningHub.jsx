import { useState } from "react";
import { BookOpen, Code, Play, Star, Clock, Users, ChevronRight, Search, Filter, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const courses = [
  // === BEGINNER ===
  // Frontend Beginner
  {
    id: 1,
    title: "HTML & CSS Essentials",
    description: "Master semantic HTML, responsive CSS, flexbox, grid, and modern layout techniques.",
    level: "beginner",
    duration: "3 hours",
    students: 18000,
    rating: 4.7,
    tags: ["HTML", "CSS", "Frontend"],
    icon: "🏗️",
  },
  {
    id: 2,
    title: "Web Design Principles",
    description: "Design stunning UIs: typography, color theory, layout, accessibility, and responsiveness.",
    level: "beginner",
    duration: "3 hours",
    students: 15600,
    rating: 4.6,
    tags: ["Design", "CSS", "UX"],
    icon: "🎨",
  },
  {
    id: 3,
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript: variables, functions, objects, and async patterns.",
    level: "beginner",
    duration: "4 hours",
    students: 12400,
    rating: 4.8,
    tags: ["JavaScript", "Web Dev", "Fundamentals"],
    icon: "📝",
  },
  {
    id: 4,
    title: "Introduction to Git & Version Control",
    description: "Master Git workflows, branching, merging, and collaboration on GitHub.",
    level: "beginner",
    duration: "2.5 hours",
    students: 21000,
    rating: 4.8,
    tags: ["Git", "Version Control", "Tools"],
    icon: "🔀",
  },
  
  // Backend Beginner
  {
    id: 5,
    title: "Python for Beginners",
    description: "Learn Python basics: syntax, data structures, functions, and object-oriented programming.",
    level: "beginner",
    duration: "4.5 hours",
    students: 14300,
    rating: 4.8,
    tags: ["Python", "Backend", "Programming"],
    icon: "🐍",
  },
  {
    id: 6,
    title: "Java Essentials",
    description: "Master Java fundamentals: syntax, OOP, collections, exception handling, and streams.",
    level: "beginner",
    duration: "5 hours",
    students: 11200,
    rating: 4.7,
    tags: ["Java", "Backend", "OOP"],
    icon: "☕",
  },
  {
    id: 7,
    title: "Command Line Basics",
    description: "Master terminal commands: navigation, file operations, scripting, and shell basics.",
    level: "beginner",
    duration: "2 hours",
    students: 16500,
    rating: 4.6,
    tags: ["CLI", "Terminal", "DevOps"],
    icon: "⌨️",
  },
  {
    id: 8,
    title: "C# Fundamentals",
    description: "Learn C# basics: syntax, OOP, LINQ, and building desktop/web applications.",
    level: "beginner",
    duration: "4.5 hours",
    students: 8900,
    rating: 4.7,
    tags: ["C#", ".NET", "Backend"],
    icon: "#️⃣",
  },

  // === INTERMEDIATE ===
  // Frontend Intermediate
  {
    id: 9,
    title: "React Basics to Advanced",
    description: "Master React: hooks, state management, performance optimization, and best practices.",
    level: "intermediate",
    duration: "6 hours",
    students: 8900,
    rating: 4.9,
    tags: ["React", "Frontend", "UI"],
    icon: "⚛️",
  },
  {
    id: 10,
    title: "Vue.js Complete Guide",
    description: "Build reactive UIs with Vue: components, directives, lifecycle, composition API.",
    level: "intermediate",
    duration: "5 hours",
    students: 6200,
    rating: 4.7,
    tags: ["Vue", "Frontend", "Framework"],
    icon: "💚",
  },
  {
    id: 11,
    title: "Angular Masterclass",
    description: "Build enterprise apps with Angular: RxJS, services, routing, forms, and testing.",
    level: "intermediate",
    duration: "7 hours",
    students: 5100,
    rating: 4.6,
    tags: ["Angular", "Frontend", "Framework"],
    icon: "🅰️",
  },
  {
    id: 12,
    title: "Advanced CSS & SASS",
    description: "Master advanced CSS: animations, preprocessors, CSS-in-JS, and optimization.",
    level: "intermediate",
    duration: "4 hours",
    students: 7800,
    rating: 4.7,
    tags: ["CSS", "SASS", "Frontend"],
    icon: "🎨",
  },
  {
    id: 13,
    title: "REST APIs & HTTP Protocols",
    description: "Understand HTTP methods, status codes, RESTful design, CORS, and API authentication.",
    level: "intermediate",
    duration: "4 hours",
    students: 9100,
    rating: 4.8,
    tags: ["API", "HTTP", "Backend"],
    icon: "🌐",
  },
  {
    id: 14,
    title: "GraphQL Fundamentals",
    description: "Master GraphQL: queries, mutations, subscriptions, and replacing REST APIs.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 5300,
    rating: 4.8,
    tags: ["GraphQL", "API", "Backend"],
    icon: "📊",
  },

  // Backend Intermediate
  {
    id: 15,
    title: "Building APIs with Node.js",
    description: "Create scalable backend services: Express, authentication, databases, and deployment.",
    level: "intermediate",
    duration: "5 hours",
    students: 7200,
    rating: 4.7,
    tags: ["Node.js", "Backend", "API"],
    icon: "🔌",
  },
  {
    id: 16,
    title: "Spring Boot & Java Web Development",
    description: "Build enterprise Java apps: Spring MVC, dependency injection, REST endpoints, security.",
    level: "intermediate",
    duration: "6.5 hours",
    students: 5800,
    rating: 4.8,
    tags: ["Java", "Spring", "Backend"],
    icon: "🌱",
  },
  {
    id: 17,
    title: "Python Flask Framework",
    description: "Build lightweight web apps with Flask: routing, templates, authentication, and extensions.",
    level: "intermediate",
    duration: "4 hours",
    students: 5600,
    rating: 4.7,
    tags: ["Python", "Flask", "Backend"],
    icon: "🍶",
  },
  {
    id: 18,
    title: "Python Django Framework",
    description: "Build full-stack apps with Django: models, views, templates, ORM, and admin panel.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 6400,
    rating: 4.7,
    tags: ["Python", "Django", "Backend"],
    icon: "🎯",
  },
  {
    id: 19,
    title: "ASP.NET Core Web Development",
    description: "Build web apps with C# and ASP.NET: controllers, views, entity framework, and dependency injection.",
    level: "intermediate",
    duration: "6 hours",
    students: 4500,
    rating: 4.6,
    tags: ["C#", ".NET", "Backend"],
    icon: "🔷",
  },
  {
    id: 20,
    title: "Ruby on Rails Framework",
    description: "Rapid web development with Rails: models, views, controllers, migrations, and testing.",
    level: "intermediate",
    duration: "5 hours",
    students: 4200,
    rating: 4.7,
    tags: ["Ruby", "Rails", "Backend"],
    icon: "💎",
  },

  // Database Intermediate
  {
    id: 21,
    title: "Database Design & SQL",
    description: "Design normalized databases and write efficient queries: PostgreSQL, indexing, transactions.",
    level: "intermediate",
    duration: "5 hours",
    students: 6800,
    rating: 4.8,
    tags: ["SQL", "Database", "Backend"],
    icon: "🗄️",
  },
  {
    id: 22,
    title: "MongoDB & NoSQL Databases",
    description: "Master NoSQL: document models, querying, indexing, and when to use NoSQL vs SQL.",
    level: "intermediate",
    duration: "4 hours",
    students: 5100,
    rating: 4.6,
    tags: ["MongoDB", "NoSQL", "Database"],
    icon: "🍃",
  },
  {
    id: 23,
    title: "Firebase & Firestore",
    description: "Build real-time apps with Firebase: authentication, firestore, storage, and hosting.",
    level: "intermediate",
    duration: "4 hours",
    students: 6700,
    rating: 4.7,
    tags: ["Firebase", "Database", "Backend"],
    icon: "🔥",
  },

  // Specialized Intermediate
  {
    id: 24,
    title: "C++ Fundamentals",
    description: "Learn C++: memory management, pointers, templates, and performance-critical code.",
    level: "intermediate",
    duration: "6 hours",
    students: 3800,
    rating: 4.6,
    tags: ["C++", "Systems Programming"],
    icon: "⚙️",
  },
  {
    id: 25,
    title: "Go Programming Language",
    description: "Master Go: goroutines, channels, concurrency patterns, and building high-performance services.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 4200,
    rating: 4.7,
    tags: ["Go", "Concurrency", "Backend"],
    icon: "🐹",
  },
  {
    id: 26,
    title: "PHP & Laravel Web Development",
    description: "Build dynamic websites with PHP and Laravel: routing, middleware, eloquent ORM.",
    level: "intermediate",
    duration: "5 hours",
    students: 5400,
    rating: 4.6,
    tags: ["PHP", "Laravel", "Backend"],
    icon: "🐘",
  },
  {
    id: 27,
    title: "Rust Programming Basics",
    description: "Learn Rust: ownership, borrowing, pattern matching, and memory safety.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 3900,
    rating: 4.8,
    tags: ["Rust", "Systems", "Performance"],
    icon: "🦀",
  },

  // === ADVANCED ===
  {
    id: 28,
    title: "TypeScript Mastery",
    description: "Leverage TypeScript for type-safe code: generics, interfaces, decorators, and tooling.",
    level: "advanced",
    duration: "4.5 hours",
    students: 5400,
    rating: 4.9,
    tags: ["TypeScript", "Advanced", "Best Practices"],
    icon: "📘",
  },
  {
    id: 29,
    title: "Advanced Java: Concurrency & Performance",
    description: "Master multi-threading, concurrent collections, GC tuning, and performance optimization.",
    level: "advanced",
    duration: "5.5 hours",
    students: 3200,
    rating: 4.8,
    tags: ["Java", "Concurrency", "Advanced"],
    icon: "⚡",
  },
  {
    id: 30,
    title: "System Design for Scalability",
    description: "Design large-scale systems: microservices, caching, load balancing, distributed systems.",
    level: "advanced",
    duration: "7 hours",
    students: 4100,
    rating: 4.9,
    tags: ["Architecture", "System Design", "Advanced"],
    icon: "🏛️",
  },
  {
    id: 31,
    title: "DevOps & Cloud Deployment",
    description: "Deploy to the cloud: Docker, Kubernetes, CI/CD pipelines, AWS, infrastructure as code.",
    level: "advanced",
    duration: "6 hours",
    students: 4700,
    rating: 4.8,
    tags: ["DevOps", "Docker", "Cloud"],
    icon: "☁️",
  },
  {
    id: 32,
    title: "Microservices Architecture",
    description: "Build microservices: service discovery, API gateways, message queues, and monitoring.",
    level: "advanced",
    duration: "7.5 hours",
    students: 3400,
    rating: 4.8,
    tags: ["Architecture", "Microservices", "Advanced"],
    icon: "🔗",
  },
  {
    id: 33,
    title: "Machine Learning with Python",
    description: "ML fundamentals: scikit-learn, pandas, numpy, data visualization, supervised learning.",
    level: "advanced",
    duration: "7 hours",
    students: 5900,
    rating: 4.8,
    tags: ["Python", "ML", "Data Science"],
    icon: "🤖",
  },
  {
    id: 34,
    title: "Deep Learning & Neural Networks",
    description: "Build neural networks: TensorFlow, Keras, CNNs, RNNs, and deep learning projects.",
    level: "advanced",
    duration: "8 hours",
    students: 4300,
    rating: 4.8,
    tags: ["Python", "Deep Learning", "AI"],
    icon: "🧠",
  },
  {
    id: 35,
    title: "Kubernetes & Container Orchestration",
    description: "Master Kubernetes: pods, services, deployments, stateful sets, and advanced networking.",
    level: "advanced",
    duration: "6.5 hours",
    students: 3600,
    rating: 4.9,
    tags: ["Kubernetes", "DevOps", "Docker"],
    icon: "⚓",
  },
  {
    id: 36,
    title: "AWS Cloud Platform Mastery",
    description: "AWS services: EC2, S3, Lambda, RDS, CloudFront, and serverless architecture.",
    level: "advanced",
    duration: "7 hours",
    students: 5200,
    rating: 4.8,
    tags: ["AWS", "Cloud", "DevOps"],
    icon: "🟠",
  },
  {
    id: 37,
    title: "Security & Cryptography",
    description: "Application security: encryption, hashing, authentication, authorization, OWASP.",
    level: "advanced",
    duration: "5.5 hours",
    students: 3100,
    rating: 4.7,
    tags: ["Security", "Cryptography", "Advanced"],
    icon: "🔐",
  },
  {
    id: 38,
    title: "Advanced Testing & Quality Assurance",
    description: "Testing strategies: unit tests, integration tests, E2E, mocking, coverage, CI/CD.",
    level: "advanced",
    duration: "5 hours",
    students: 3800,
    rating: 4.7,
    tags: ["Testing", "QA", "DevOps"],
    icon: "✅",
  },
  {
    id: 39,
    title: "Blockchain & Smart Contracts",
    description: "Blockchain fundamentals: Solidity, Ethereum, smart contracts, Web3.js.",
    level: "advanced",
    duration: "6 hours",
    students: 2900,
    rating: 4.7,
    tags: ["Blockchain", "Web3", "Advanced"],
    icon: "⛓️",
  },
  {
    id: 40,
    title: "Mobile Development with React Native",
    description: "Cross-platform mobile: React Native, iOS/Android, native modules, deployment.",
    level: "advanced",
    duration: "6.5 hours",
    students: 4100,
    rating: 4.8,
    tags: ["React Native", "Mobile", "JavaScript"],
    icon: "📱",
  },

  // === ADDITIONAL FRAMEWORKS & LIBRARIES ===
  {
    id: 41,
    title: "Next.js Full-Stack Framework",
    description: "Build full-stack apps with Next.js: SSR, SSG, API routes, authentication, deployment.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 7100,
    rating: 4.8,
    tags: ["Next.js", "React", "Full-stack"],
    icon: "▲",
  },
  {
    id: 42,
    title: "Nuxt.js & Vue Full-Stack",
    description: "Full-stack development with Nuxt: SSR, API integration, modules, and deployment.",
    level: "intermediate",
    duration: "5 hours",
    students: 4800,
    rating: 4.7,
    tags: ["Nuxt", "Vue", "Full-stack"],
    icon: "🟢",
  },
  {
    id: 43,
    title: "Svelte Framework Essentials",
    description: "Learn Svelte: reactive declarations, stores, animations, and building fast UIs.",
    level: "intermediate",
    duration: "4 hours",
    students: 3500,
    rating: 4.8,
    tags: ["Svelte", "Frontend", "Reactive"],
    icon: "🔥",
  },
  {
    id: 44,
    title: "Tailwind CSS Mastery",
    description: "Build modern UIs with Tailwind: utilities, customization, responsive design, plugins.",
    level: "intermediate",
    duration: "3.5 hours",
    students: 8200,
    rating: 4.9,
    tags: ["Tailwind", "CSS", "Frontend"],
    icon: "🎨",
  },
  {
    id: 45,
    title: "Web Components & Custom Elements",
    description: "Build reusable web components: Shadow DOM, custom elements, slots, and APIs.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 3200,
    rating: 4.6,
    tags: ["Web Components", "Frontend", "Standards"],
    icon: "🧩",
  },
  {
    id: 46,
    title: "Express.js Advanced Patterns",
    description: "Master Express.js: middleware, error handling, performance, security best practices.",
    level: "advanced",
    duration: "4.5 hours",
    students: 4300,
    rating: 4.7,
    tags: ["Node.js", "Express", "Backend"],
    icon: "🚂",
  },
  {
    id: 47,
    title: "Fastify High-Performance Framework",
    description: "Build ultra-fast APIs with Fastify: hooks, plugins, validation, and streaming.",
    level: "intermediate",
    duration: "4 hours",
    students: 2800,
    rating: 4.8,
    tags: ["Node.js", "Fastify", "Performance"],
    icon: "⚡",
  },
  {
    id: 48,
    title: "Nest.js Enterprise Backend",
    description: "Build scalable backends with Nest.js: decorators, modules, controllers, services.",
    level: "intermediate",
    duration: "6 hours",
    students: 4100,
    rating: 4.8,
    tags: ["Node.js", "Nest.js", "Backend"],
    icon: "🏗️",
  },

  // === MOBILE & CROSS-PLATFORM ===
  {
    id: 49,
    title: "Swift iOS Development",
    description: "Build iOS apps with Swift: UIKit, SwiftUI, navigation, networking, and App Store.",
    level: "intermediate",
    duration: "6.5 hours",
    students: 5200,
    rating: 4.8,
    tags: ["Swift", "iOS", "Mobile"],
    icon: "🍎",
  },
  {
    id: 50,
    title: "Kotlin Android Development",
    description: "Build Android apps with Kotlin: activities, fragments, lifecycle, databases, services.",
    level: "intermediate",
    duration: "6.5 hours",
    students: 4900,
    rating: 4.7,
    tags: ["Kotlin", "Android", "Mobile"],
    icon: "🤖",
  },
  {
    id: 51,
    title: "Flutter Cross-Platform Apps",
    description: "Build iOS and Android apps with Flutter: widgets, state management, animations.",
    level: "intermediate",
    duration: "6 hours",
    students: 5600,
    rating: 4.8,
    tags: ["Flutter", "Dart", "Mobile"],
    icon: "🐦",
  },

  // === ADVANCED LANGUAGES ===
  {
    id: 52,
    title: "Scala for Advanced Developers",
    description: "Functional programming with Scala: pattern matching, higher-order functions, types.",
    level: "advanced",
    duration: "6 hours",
    students: 2200,
    rating: 4.7,
    tags: ["Scala", "Functional", "JVM"],
    icon: "📚",
  },
  {
    id: 53,
    title: "Elixir & Functional Programming",
    description: "Functional programming with Elixir: pattern matching, processes, and OTP.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 2600,
    rating: 4.7,
    tags: ["Elixir", "Functional", "Backend"],
    icon: "💜",
  },
  {
    id: 54,
    title: "Kotlin Coroutines & Advanced Features",
    description: "Advanced Kotlin: coroutines, DSLs, reflection, and performance optimization.",
    level: "advanced",
    duration: "5 hours",
    students: 2800,
    rating: 4.8,
    tags: ["Kotlin", "Advanced", "JVM"],
    icon: "⚡",
  },

  // === DATA STRUCTURES & ALGORITHMS ===
  {
    id: 55,
    title: "Data Structures Fundamentals",
    description: "Essential data structures: arrays, linked lists, stacks, queues, trees, graphs.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 9800,
    rating: 4.9,
    tags: ["Algorithms", "Fundamentals", "Computer Science"],
    icon: "📊",
  },
  {
    id: 56,
    title: "Algorithms & Problem Solving",
    description: "Algorithm design: sorting, searching, dynamic programming, greedy, and optimization.",
    level: "advanced",
    duration: "7 hours",
    students: 8200,
    rating: 4.9,
    tags: ["Algorithms", "Advanced", "Interview Prep"],
    icon: "🧩",
  },
  {
    id: 57,
    title: "Coding Interview Preparation",
    description: "Master technical interviews: problem solving, system design, behavioral questions.",
    level: "advanced",
    duration: "8 hours",
    students: 10500,
    rating: 4.8,
    tags: ["Interviews", "Problem Solving", "Career"],
    icon: "💼",
  },

  // === DESIGN PATTERNS & ARCHITECTURE ===
  {
    id: 58,
    title: "Design Patterns Mastery",
    description: "GoF patterns: creational, structural, behavioral patterns with real-world examples.",
    level: "advanced",
    duration: "6 hours",
    students: 4500,
    rating: 4.8,
    tags: ["Design Patterns", "Architecture", "Advanced"],
    icon: "🎯",
  },
  {
    id: 59,
    title: "Domain-Driven Design",
    description: "DDD principles: bounded contexts, aggregates, value objects, and event sourcing.",
    level: "advanced",
    duration: "5.5 hours",
    students: 2900,
    rating: 4.7,
    tags: ["DDD", "Architecture", "Design"],
    icon: "🏗️",
  },
  {
    id: 60,
    title: "Clean Code & SOLID Principles",
    description: "Write maintainable code: SOLID principles, refactoring, naming, and testing.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 6700,
    rating: 4.9,
    tags: ["Best Practices", "Code Quality", "Professional"],
    icon: "✨",
  },

  // === DATABASE ADVANCED ===
  {
    id: 61,
    title: "Redis & Caching Strategies",
    description: "In-memory data store Redis: caching, sessions, pub/sub, streams, and clustering.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 4300,
    rating: 4.8,
    tags: ["Redis", "Caching", "Database"],
    icon: "🔴",
  },
  {
    id: 62,
    title: "Elasticsearch & Search",
    description: "Full-text search with Elasticsearch: indexing, querying, aggregations, analysis.",
    level: "intermediate",
    duration: "5 hours",
    students: 3800,
    rating: 4.7,
    tags: ["Elasticsearch", "Search", "Database"],
    icon: "🔍",
  },
  {
    id: 63,
    title: "Apache Kafka & Event Streaming",
    description: "Stream processing with Kafka: topics, producers, consumers, and stream topology.",
    level: "advanced",
    duration: "5.5 hours",
    students: 3200,
    rating: 4.8,
    tags: ["Kafka", "Streaming", "Architecture"],
    icon: "📡",
  },
  {
    id: 64,
    title: "RabbitMQ & Message Queues",
    description: "Message brokers: RabbitMQ, queues, exchanges, routing, and pub/sub patterns.",
    level: "intermediate",
    duration: "4 hours",
    students: 3100,
    rating: 4.7,
    tags: ["RabbitMQ", "Messaging", "Backend"],
    icon: "🐰",
  },

  // === CLOUD PLATFORMS ===
  {
    id: 65,
    title: "Google Cloud Platform (GCP)",
    description: "GCP services: Compute Engine, App Engine, Cloud Functions, Datastore.",
    level: "advanced",
    duration: "6.5 hours",
    students: 3500,
    rating: 4.7,
    tags: ["Google Cloud", "Cloud", "DevOps"],
    icon: "☁️",
  },
  {
    id: 66,
    title: "Microsoft Azure Cloud",
    description: "Azure services: App Service, Functions, Databases, Virtual Machines, DevOps.",
    level: "advanced",
    duration: "6.5 hours",
    students: 3200,
    rating: 4.7,
    tags: ["Azure", "Cloud", "DevOps"],
    icon: "🔷",
  },
  {
    id: 67,
    title: "Serverless Architecture with AWS Lambda",
    description: "Serverless computing: Lambda, API Gateway, DynamoDB, S3, and event-driven apps.",
    level: "advanced",
    duration: "5.5 hours",
    students: 4800,
    rating: 4.8,
    tags: ["Serverless", "AWS", "Architecture"],
    icon: "⚡",
  },

  // === TESTING FRAMEWORKS ===
  {
    id: 68,
    title: "Jest Testing Framework",
    description: "JavaScript testing with Jest: unit tests, mocking, snapshots, and coverage.",
    level: "intermediate",
    duration: "4 hours",
    students: 6400,
    rating: 4.8,
    tags: ["Jest", "Testing", "JavaScript"],
    icon: "🧪",
  },
  {
    id: 69,
    title: "Selenium & E2E Testing",
    description: "End-to-end testing: Selenium, WebDriver, test automation, and browser testing.",
    level: "intermediate",
    duration: "5 hours",
    students: 4200,
    rating: 4.6,
    tags: ["Selenium", "Testing", "QA"],
    icon: "🔍",
  },
  {
    id: 70,
    title: "Cypress Modern Testing",
    description: "Modern E2E testing: Cypress, component testing, debugging, and CI/CD integration.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 4900,
    rating: 4.8,
    tags: ["Cypress", "Testing", "E2E"],
    icon: "🌳",
  },

  // === GAME DEVELOPMENT ===
  {
    id: 71,
    title: "Unity Game Development Basics",
    description: "Game development with Unity: C#, scenes, physics, animations, and publishing.",
    level: "intermediate",
    duration: "7 hours",
    students: 5800,
    rating: 4.7,
    tags: ["Unity", "Game Dev", "C#"],
    icon: "🎮",
  },
  {
    id: 72,
    title: "Unreal Engine Development",
    description: "3D games with Unreal: Blueprints, C++, physics, rendering, and VR support.",
    level: "intermediate",
    duration: "8 hours",
    students: 4100,
    rating: 4.6,
    tags: ["Unreal Engine", "Game Dev", "C++"],
    icon: "🎮",
  },
  {
    id: 73,
    title: "Game Development with Three.js",
    description: "3D graphics in browser: Three.js, WebGL, scenes, cameras, and interactive games.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 3600,
    rating: 4.7,
    tags: ["Three.js", "WebGL", "Game Dev"],
    icon: "🎯",
  },

  // === WEB SCRAPING & AUTOMATION ===
  {
    id: 74,
    title: "Web Scraping with Python",
    description: "Data extraction: BeautifulSoup, Selenium, APIs, and ethical scraping practices.",
    level: "intermediate",
    duration: "4 hours",
    students: 5300,
    rating: 4.7,
    tags: ["Python", "Web Scraping", "Data"],
    icon: "🕷️",
  },
  {
    id: 75,
    title: "RPA & Process Automation",
    description: "Robotic process automation: UiPath, Blue Prism, task automation, and workflows.",
    level: "intermediate",
    duration: "5 hours",
    students: 2800,
    rating: 4.6,
    tags: ["RPA", "Automation", "Tools"],
    icon: "🤖",
  },

  // === PERFORMANCE & OPTIMIZATION ===
  {
    id: 76,
    title: "Web Performance Optimization",
    description: "Fast websites: caching, compression, CDNs, lazy loading, and Core Web Vitals.",
    level: "advanced",
    duration: "4.5 hours",
    students: 4100,
    rating: 4.8,
    tags: ["Performance", "Optimization", "Web"],
    icon: "⚡",
  },
  {
    id: 77,
    title: "Database Performance Tuning",
    description: "Query optimization: indexing, execution plans, caching, and database tuning.",
    level: "advanced",
    duration: "5 hours",
    students: 3400,
    rating: 4.8,
    tags: ["Database", "Performance", "Optimization"],
    icon: "🚀",
  },

  // === API & INTEGRATION ===
  {
    id: 78,
    title: "API Design Best Practices",
    description: "Design RESTful APIs: versioning, pagination, caching, documentation, and standards.",
    level: "advanced",
    duration: "4 hours",
    students: 3900,
    rating: 4.8,
    tags: ["API", "Design", "Architecture"],
    icon: "📡",
  },
  {
    id: 79,
    title: "OAuth 2.0 & Authentication",
    description: "Secure auth: OAuth 2.0, OpenID Connect, JWT, SAML, and best practices.",
    level: "advanced",
    duration: "4.5 hours",
    students: 3200,
    rating: 4.8,
    tags: ["Security", "Authentication", "API"],
    icon: "🔐",
  },

  // === SOFT SKILLS ===
  {
    id: 80,
    title: "Technical Writing for Developers",
    description: "Write technical docs: README files, API docs, tutorials, and developer guides.",
    level: "beginner",
    duration: "3 hours",
    students: 4600,
    rating: 4.7,
    tags: ["Documentation", "Communication", "Skills"],
    icon: "📝",
  },
  {
    id: 81,
    title: "Working in Teams & Code Review",
    description: "Collaboration: code reviews, pair programming, communication, and best practices.",
    level: "beginner",
    duration: "2.5 hours",
    students: 5200,
    rating: 4.7,
    tags: ["Teamwork", "Communication", "Professional"],
    icon: "👥",
  },

  // === ART & DRAWING ===
  {
    id: 82,
    title: "Drawing Fundamentals",
    description: "Master the basics: line, shape, form, perspective, shading, and composition.",
    level: "beginner",
    duration: "4 hours",
    students: 8900,
    rating: 4.8,
    tags: ["Drawing", "Art Fundamentals", "Beginner"],
    icon: "✏️",
  },
  {
    id: 83,
    title: "Anatomy for Artists",
    description: "Learn human and animal anatomy: proportions, skeletal structure, and muscles.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 6200,
    rating: 4.8,
    tags: ["Anatomy", "Drawing", "Art"],
    icon: "🦴",
  },
  {
    id: 84,
    title: "Character Design Essentials",
    description: "Create memorable characters: silhouettes, expression, personality, and variations.",
    level: "intermediate",
    duration: "5 hours",
    students: 5800,
    rating: 4.8,
    tags: ["Character Design", "Art", "Design"],
    icon: "🧑",
  },
  {
    id: 85,
    title: "Digital Painting Fundamentals",
    description: "Learn digital art: brushes, layers, color theory, and digital painting techniques.",
    level: "intermediate",
    duration: "5 hours",
    students: 6500,
    rating: 4.8,
    tags: ["Digital Art", "Painting", "Design"],
    icon: "🎨",
  },
  {
    id: 86,
    title: "Hand Helper: Stroke Stabilization",
    description: "Master smooth, stable strokes with Hand Helper: drawing techniques & practice drills.",
    level: "beginner",
    duration: "1.5 hours",
    students: 4200,
    rating: 4.9,
    tags: ["Drawing Tools", "Hand Control", "Technique"],
    icon: "🖐️",
  },
  {
    id: 87,
    title: "Tracer: Line Tracing & Precision",
    description: "Perfect your line control with Tracer: trace accurately and build muscle memory.",
    level: "beginner",
    duration: "1.5 hours",
    students: 3800,
    rating: 4.8,
    tags: ["Drawing Tools", "Line Work", "Precision"],
    icon: "📱",
  },
  {
    id: 88,
    title: "Perspective Drawing Mastery",
    description: "Master 1-point, 2-point, and 3-point perspective: environments and composition.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 5400,
    rating: 4.8,
    tags: ["Perspective", "Drawing", "Technique"],
    icon: "🏙️",
  },
  {
    id: 89,
    title: "Illustration & Visual Storytelling",
    description: "Tell stories with art: narrative illustration, mood, composition, and style.",
    level: "intermediate",
    duration: "5 hours",
    students: 4900,
    rating: 4.7,
    tags: ["Illustration", "Storytelling", "Art"],
    icon: "📖",
  },
  {
    id: 90,
    title: "Concept Art for Games & Film",
    description: "Create concept art: environments, creatures, props, and production design.",
    level: "advanced",
    duration: "6.5 hours",
    students: 4100,
    rating: 4.8,
    tags: ["Concept Art", "Game Dev", "Film"],
    icon: "🎬",
  },
  {
    id: 91,
    title: "Color Theory & Application",
    description: "Master color: harmony, psychology, mood, and effective color composition.",
    level: "intermediate",
    duration: "4 hours",
    students: 5600,
    rating: 4.8,
    tags: ["Color", "Design", "Theory"],
    icon: "🌈",
  },
  {
    id: 92,
    title: "Portrait Drawing & Painting",
    description: "Draw and paint portraits: features, expression, likeness, and different mediums.",
    level: "intermediate",
    duration: "5 hours",
    students: 6100,
    rating: 4.8,
    tags: ["Portraits", "Drawing", "Painting"],
    icon: "👤",
  },
  {
    id: 93,
    title: "Landscape & Environment Art",
    description: "Paint natural landscapes: terrain, weather, lighting, and environmental design.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 4700,
    rating: 4.7,
    tags: ["Landscape", "Environment", "Painting"],
    icon: "🏞️",
  },
  {
    id: 94,
    title: "Animation Principles & Motion",
    description: "Learn animation: 12 principles, timing, easing, and bringing art to life.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 5200,
    rating: 4.8,
    tags: ["Animation", "Motion", "Art"],
    icon: "🎞️",
  },
  {
    id: 95,
    title: "Adobe Photoshop Mastery",
    description: "Professional image editing: layers, masks, filters, effects, and retouching.",
    level: "intermediate",
    duration: "6 hours",
    students: 7800,
    rating: 4.8,
    tags: ["Photoshop", "Image Editing", "Design"],
    icon: "🎨",
  },
  {
    id: 96,
    title: "Adobe Illustrator & Vector Art",
    description: "Create vector graphics: shapes, paths, color, and scalable illustrations.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 6900,
    rating: 4.8,
    tags: ["Illustrator", "Vector Art", "Design"],
    icon: "✨",
  },
  {
    id: 97,
    title: "Clip Studio Paint for Digital Art",
    description: "Master Clip Studio Paint: brushes, layers, 3D models, and animation ready.",
    level: "intermediate",
    duration: "5 hours",
    students: 4500,
    rating: 4.8,
    tags: ["Clip Studio Paint", "Digital Art", "Tools"],
    icon: "🖌️",
  },
  {
    id: 98,
    title: "Procreate iPad Drawing",
    description: "Create on iPad with Procreate: brushes, gestures, animation, and design.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 5100,
    rating: 4.8,
    tags: ["Procreate", "iPad", "Digital Art"],
    icon: "📱",
  },
  {
    id: 99,
    title: "3D Modeling & Sculpting Basics",
    description: "3D art fundamentals: Blender, modeling, sculpting, materials, and rendering.",
    level: "intermediate",
    duration: "6.5 hours",
    students: 4800,
    rating: 4.7,
    tags: ["3D Modeling", "Blender", "Art"],
    icon: "🎯",
  },
  {
    id: 100,
    title: "Game Art & Texturing",
    description: "Create game assets: modeling, UV mapping, texturing, and optimization.",
    level: "advanced",
    duration: "6 hours",
    students: 3900,
    rating: 4.8,
    tags: ["Game Art", "Texturing", "3D"],
    icon: "🎮",
  },
  {
    id: 101,
    title: "UI/UX Design Principles",
    description: "Design user interfaces: wireframing, prototyping, usability, and accessibility.",
    level: "intermediate",
    duration: "5 hours",
    students: 7200,
    rating: 4.8,
    tags: ["UI/UX", "Design", "User Experience"],
    icon: "🎨",
  },
  {
    id: 102,
    title: "Figma for Product Design",
    description: "Design with Figma: components, prototypes, collaboration, and design systems.",
    level: "intermediate",
    duration: "5 hours",
    students: 6800,
    rating: 4.8,
    tags: ["Figma", "Design", "Product Design"],
    icon: "🎨",
  },
  {
    id: 103,
    title: "Comic Art & Manga Drawing",
    description: "Draw comics and manga: panel layout, inking, lettering, and storytelling.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 4600,
    rating: 4.8,
    tags: ["Comics", "Manga", "Drawing"],
    icon: "💭",
  },
  {
    id: 104,
    title: "Traditional Art Techniques",
    description: "Master traditional media: watercolor, oil, acrylic, charcoal, and mixed media.",
    level: "intermediate",
    duration: "5 hours",
    students: 4300,
    rating: 4.7,
    tags: ["Traditional Art", "Painting", "Media"],
    icon: "🎨",
  },
  {
    id: 105,
    title: "Motion Graphics & VFX",
    description: "Create motion graphics: After Effects, animation, visual effects, and compositing.",
    level: "advanced",
    duration: "6.5 hours",
    students: 3700,
    rating: 4.8,
    tags: ["Motion Graphics", "After Effects", "VFX"],
    icon: "🎬",
  },
  {
    id: 106,
    title: "Web Design & UI Development",
    description: "Design and code websites: responsive design, CSS, animations, and interactions.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 6500,
    rating: 4.8,
    tags: ["Web Design", "UI", "CSS"],
    icon: "🌐",
  },
];

const resources = [
  { name: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "📚", desc: "Comprehensive web dev reference" },
  { name: "GitHub", url: "https://github.com", icon: "🐙", desc: "Version control & code hosting" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "❓", desc: "Q&A for developers" },
  { name: "Dev.to", url: "https://dev.to", icon: "💻", desc: "Developer articles & tutorials" },
];

export default function LearningHub() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-xl">
            📚
          </span>
          <div>
            <h1 className="text-2xl font-black text-white">Learning Hub</h1>
            <p className="text-sm text-blue-100/50">Level up your coding skills with curated courses and resources</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/40" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#06101f] border-[#12305f]/60 text-white"
          />
        </div>
        <div className="flex gap-1 bg-[#06101f]/90 border border-[#12305f]/60 rounded-xl p-1">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition ${
                levelFilter === level
                  ? "bg-[#1e78ff]/20 text-white border border-[#1e78ff]/50"
                  : "text-blue-100/60 hover:text-white"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <button
            key={course.id}
            className="group text-left rounded-2xl border border-[#12305f]/70 bg-[#06101f]/90 p-4 hover:border-[#1e78ff]/40 hover:shadow-lg hover:shadow-[#1e78ff]/10 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{course.icon}</span>
              <span className="rounded-full bg-[#1e78ff]/20 px-2 py-1 text-[10px] font-black text-[#00c8ff] capitalize">
                {course.level}
              </span>
            </div>
            <h3 className="font-black text-white mb-1.5 group-hover:text-[#00c8ff] transition">{course.title}</h3>
            <p className="text-xs text-blue-100/60 mb-3 line-clamp-2">{course.description}</p>

            <div className="space-y-2 mb-3 pb-3 border-b border-[#12305f]/50">
              <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                <Clock className="h-3 w-3" /> {course.duration}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                <Users className="h-3 w-3" /> {(course.students / 1000).toFixed(1)}k students
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] text-amber-300">{course.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {course.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#1e78ff]/12 px-2 py-0.5 text-[9px] font-black text-[#00c8ff]">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 font-black text-[#00c8ff] text-sm group-hover:gap-3 transition">
              <Play className="h-3.5 w-3.5" />
              Start Learning
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            </div>
          </button>
        ))}
      </div>

      {/* Resources */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-[#00c8ff]" />
          <h2 className="text-lg font-black text-white">Recommended Resources</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/8 transition"
            >
              <span className="text-xl">{resource.icon}</span>
              <div className="min-w-0">
                <p className="font-black text-white text-sm group-hover:text-[#00c8ff] truncate">{resource.name}</p>
                <p className="text-[10px] text-blue-100/40">{resource.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Drawing Learning Tools */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">✏️</span>
          <h2 className="text-lg font-black text-white">Drawing & Tracing Tools</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "Tracer",
              desc: "Upload an image and use your phone to trace lines and shapes in real-time",
              icon: "📱",
              features: ["Image upload", "Live tracing", "Phone camera", "Line detection"],
            },
            {
              name: "Hand Helper",
              desc: "AI-powered drawing assistant that helps stabilize your strokes and improve technique",
              icon: "🖐️",
              features: ["Stroke stabilization", "Technique tips", "Real-time feedback", "Practice modes"],
            },
          ].map((tool) => (
            <div key={tool.name} className="rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-black text-white">{tool.name}</h3>
                  <p className="text-xs text-blue-100/60 mt-0.5">{tool.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {tool.features.map((feature) => (
                  <span key={feature} className="rounded-full bg-[#1e78ff]/12 px-2 py-0.5 text-[9px] font-black text-[#00c8ff]">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[#a855f7]" />
          <h2 className="text-lg font-black text-white">Popular Learning Paths</h2>
        </div>
        
        <div className="space-y-4">
          {/* Frontend Path */}
          <div>
            <h3 className="text-sm font-black text-[#00c8ff] mb-2">🎨 Frontend Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "HTML & CSS Essentials", desc: "Web fundamentals" },
                { step: 2, title: "JavaScript Fundamentals", desc: "Core language" },
                { step: 3, title: "React Basics to Advanced", desc: "Modern UI library" },
                { step: 4, title: "TypeScript Mastery", desc: "Type-safe code" },
              ].map(({ step, title, desc }) => (
                <div key={`frontend-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e78ff]/20 text-xs font-black text-[#00c8ff] flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Path */}
          <div>
            <h3 className="text-sm font-black text-emerald-400 mb-2">⚙️ Backend Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Python for Beginners", desc: "Beginner-friendly language" },
                { step: 2, title: "REST APIs & HTTP Protocols", desc: "Web API fundamentals" },
                { step: 3, title: "Building APIs with Node.js", desc: "JavaScript backend" },
                { step: 4, title: "Database Design & SQL", desc: "Data persistence" },
                { step: 5, title: "System Design for Scalability", desc: "Large-scale systems" },
              ].map(({ step, title, desc }) => (
                <div key={`backend-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Java Path */}
          <div>
            <h3 className="text-sm font-black text-amber-400 mb-2">☕ Java Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Java Essentials", desc: "Core language & OOP" },
                { step: 2, title: "REST APIs & HTTP Protocols", desc: "Web fundamentals" },
                { step: 3, title: "Spring Boot & Java Web Development", desc: "Enterprise framework" },
                { step: 4, title: "Database Design & SQL", desc: "Data management" },
                { step: 5, title: "Advanced Java: Concurrency & Performance", desc: "Expert level" },
              ].map(({ step, title, desc }) => (
                <div key={`java-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Art & Drawing Tools */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-black text-white">Drawing Tools & Practice</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <h4 className="font-black text-purple-300 mb-2 flex items-center gap-2">
              🖐️ Hand Helper
            </h4>
            <p className="text-sm text-blue-100/70 mb-3">Improve stroke stability and hand control with guided drawing exercises.</p>
            <button className="w-full rounded-lg bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 font-black text-sm py-2 transition">
              Start Practicing
            </button>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <h4 className="font-black text-cyan-300 mb-2 flex items-center gap-2">
              📱 Tracer
            </h4>
            <p className="text-sm text-blue-100/70 mb-3">Trace lines accurately and build precision with phone-based line tracing exercises.</p>
            <button className="w-full rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm py-2 transition">
              Start Tracing
            </button>
          </div>
        </div>
      </div>

      {/* Alternative Skills */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <h3 className="text-lg font-black text-white mb-3">📚 Programming Languages & Frameworks</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { lang: "JavaScript/Node.js", level: "Beginner to Expert", icon: "📝" },
            { lang: "Python", level: "Beginner to Expert", icon: "🐍" },
            { lang: "Java", level: "Beginner to Expert", icon: "☕" },
            { lang: "C++", level: "Intermediate to Expert", icon: "⚙️" },
            { lang: "Go", level: "Intermediate to Expert", icon: "🐹" },
            { lang: "React/Vue.js", level: "Beginner to Expert", icon: "⚛️" },
            { lang: "Django/Flask", level: "Intermediate to Expert", icon: "🎯" },
            { lang: "Spring Boot", level: "Intermediate to Expert", icon: "🌱" },
            { lang: "DevOps & Cloud", level: "Intermediate to Expert", icon: "☁️" },
          ].map(({ lang, level, icon }) => (
            <div key={lang} className="rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <p className="font-black text-white text-sm">{lang}</p>
              </div>
              <p className="text-xs text-blue-100/50">{level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Art & Design Learning Path */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <h3 className="text-lg font-black text-white mb-3">🎨 Art & Design Learning Paths</h3>
        <div className="space-y-4">
          {/* Digital Artist Path */}
          <div>
            <h4 className="text-sm font-black text-purple-400 mb-2">🖌️ Digital Artist Path</h4>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Drawing Fundamentals", desc: "Core techniques & theory" },
                { step: 2, title: "Anatomy for Artists", desc: "Human & creature anatomy" },
                { step: 3, title: "Digital Painting Fundamentals", desc: "Learn digital tools" },
                { step: 4, title: "Procreate iPad Drawing", desc: "iPad digital art" },
                { step: 5, title: "Character Design Essentials", desc: "Create unique characters" },
              ].map(({ step, title, desc }) => (
                <div key={`digital-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs font-black text-purple-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Artist Path */}
          <div>
            <h4 className="text-sm font-black text-cyan-400 mb-2">🎮 Game Artist Path</h4>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Drawing Fundamentals", desc: "Core techniques" },
                { step: 2, title: "Character Design Essentials", desc: "Game character creation" },
                { step: 3, title: "3D Modeling & Sculpting Basics", desc: "Learn 3D tools" },
                { step: 4, title: "Game Art & Texturing", desc: "Assets & optimization" },
                { step: 5, title: "Animation Principles & Motion", desc: "Bring characters to life" },
              ].map(({ step, title, desc }) => (
                <div key={`game-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-black text-cyan-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI/UX Designer Path */}
          <div>
            <h4 className="text-sm font-black text-amber-400 mb-2">🎨 UI/UX Designer Path</h4>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Design Principles & Color Theory", desc: "Visual fundamentals" },
                { step: 2, title: "UI/UX Design Principles", desc: "User-centered design" },
                { step: 3, title: "Figma for Product Design", desc: "Professional design tool" },
                { step: 4, title: "Web Design & UI Development", desc: "Code your designs" },
                { step: 5, title: "Animation Principles & Motion", desc: "Interactive UX" },
              ].map(({ step, title, desc }) => (
                <div key={`uiux-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Learning Path Section - Hidden */}
      <div className="hidden">
        <div className="space-y-2">
          {[
            { step: 1, title: "JavaScript Fundamentals", desc: "Master core language concepts" },
            { step: 2, title: "Web Design Principles", desc: "Learn UI/UX and CSS" },
            { step: 3, title: "React Basics to Advanced", desc: "Build modern frontends" },
            { step: 4, title: "Building APIs with Node.js", desc: "Create backend services" },
            { step: 5, title: "Database Design & SQL", desc: "Store and query data" },
            { step: 6, title: "TypeScript Mastery", desc: "Write production-grade code" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3 rounded-xl border border-[#12305f]/50 bg-[#03080f]/55 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e78ff]/20 text-xs font-black text-[#00c8ff] flex-shrink-0">
                {step}
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-sm">{title}</p>
                <p className="text-xs text-blue-100/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}