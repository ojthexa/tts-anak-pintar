# TTS Anak Pintar 🧩

**Educational Crossword Puzzle Game for Indonesian Elementary School Students**

TTS Anak Pintar is a modern, AI-powered crossword puzzle (Teka-Teki Silang) game designed for SD (Sekolah Dasar) students in grades 1-6. The app automatically generates educational crossword puzzles across 6 subjects using AI.

![TTS Anak Pintar](https://img.shields.io/badge/TTS-Anak%20Pintar-8B5CF6)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4)

---

## ✨ Features

### 🎮 Game Modes
- **Daily Puzzle** — New puzzle every day
- **Random Puzzle** — Unlimited AI-generated puzzles
- **Practice Mode** — Choose subject, grade, and difficulty
- **Challenge Mode** — Timed competition

### 📚 Subjects
| Subject | Topics |
|---------|--------|
| 🕌 Agama Islam | Rukun Islam, Rukun Iman, Nabi, Malaikat, Wudhu, Sholat |
| 📖 Al-Qur'an | Nama surat, Juz, Tajwid, Huruf hijaiyah |
| 📜 Hadits | Hadits pendek, Makna, Adab, Kejujuran |
| 🖋️ Bahasa Arab | Kosakata, Anggota tubuh, Hewan, Buah, Warna |
| 🔤 Bahasa Inggris | Animal, Fruit, Color, Family, School |
| 🌟 Pengetahuan Umum | Sains, Matematika, Indonesia, Tubuh manusia |

### 🤖 AI Integration
- Automatic puzzle generation using OpenAI
- Age-appropriate questions per grade level
- Islamic content verified from authentic sources
- Caching system to reuse generated puzzles

### 🏆 Gamification
- XP and level system
- Achievement badges (12+ achievements)
- Combo scoring system
- Leaderboard
- Streak tracking

### 👨‍🏫 Dashboards
- **Student** — Progress tracking, stats, achievements
- **Teacher** — Classroom management, assignments, monitoring
- **Parent** — Child progress, weak/strong subjects
- **Admin** — User management, puzzle moderation, AI usage

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Claymorphism Design
- **UI:** shadcn/ui components
- **Animation:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI:** OpenAI SDK (GPT-4o-mini)
- **State:** Zustand
- **Package Manager:** Bun

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tts-anak-pintar

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Run the SQL schema:
```bash
# In Supabase SQL Editor, paste and execute:
database/schema.sql
```

2. Or push using Supabase CLI:
```bash
supabase db push
```

### Development

```bash
# Start development server
bun dev

# Or with npm
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── register/          # Registration
│   ├── play/              # Game mode selection
│   ├── game/              # Crossword game
│   ├── dashboard/         # Student dashboard
│   ├── profile/           # User profile
│   └── leaderboard/       # Leaderboard
├── components/
│   ├── crossword/         # Crossword game components
│   └── ui/               # shadcn UI components
├── engine/                # Crossword generation algorithm
├── services/
│   ├── ai/               # OpenAI integration
│   ├── supabase/         # Database services
│   └── game/             # Scoring & game logic
├── hooks/                # React hooks
├── types/                # TypeScript types
├── lib/                  # Utilities & constants
└── providers/            # React context providers
database/
└── schema.sql           # Supabase PostgreSQL schema
```

---

## 🧩 Crossword Engine

The crossword engine uses a graph-based backtracking algorithm:

1. **Word Sorting** — Words sorted by length (longest first)
2. **First Placement** — Longest word placed in the center
3. **Intersection Search** — Each subsequent word attempts intersections with placed words
4. **Validation** — Collision detection, adjacency checks
5. **Score** — Placement scored by number of intersections
6. **Randomization** — Seeded RNG ensures different layouts each time
7. **Fallback** — If layout fails after 100 attempts, creates non-intersecting layout
8. **Grid Trimming** — Grid trimmed to content bounds

---

## 🤖 AI Prompt Engineering

The AI system uses carefully designed prompts for each subject:

- **Age-appropriate language** per grade level
- **Authentic Islamic content** with source references
- **Safety guidelines** prevent fabricated knowledge
- **JSON mode** ensures structured output
- **Metadata tracking** stores source categories for review

---

## 🎨 Design System

### Claymorphism Theme
- Soft, plush rounded surfaces
- Matte pastel color palette
- Inflated shadows for depth
- Playful but polished feel
- Dark mode support

### Colors
```
Primary:   #a8e6cf (Mint)
Secondary: #d4c5f9 (Lavender)
Accent:    #f8b4c8 (Pink)
Warm:      #ffd3b6 (Peach)
Sand:      #f5e6cc (Warm white)
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OPENAI_API_KEY`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🧪 Testing

```bash
# Run type check
bun tsc --noEmit

# Run lint
bun lint
```

---

## 🔮 Roadmap

- [x] Crossword generation engine
- [x] AI question generation
- [x] Supabase database schema
- [x] Landing page & auth
- [x] Game UI with keyboard navigation
- [x] Claymorphism theme
- [x] Scoring & achievements
- [ ] Offline mode (PWA)
- [ ] Audio pronunciation
- [ ] Multiplayer mode
- [ ] Printable crossword PDF
- [ ] Parent dashboard
- [ ] Teacher classroom features
- [ ] Daily push notifications

---

## 📄 License

MIT © 2026 TTS Anak Pintar

---

## 🙏 Acknowledgements

- shadcn/ui for beautiful components
- Supabase for the amazing backend
- OpenAI for AI capabilities
- Framer Motion for animations

---

**Belajar sambil bermain! 🧩✨**
