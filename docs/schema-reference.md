# Schema Reference

Complete reference for all mcp-me YAML profile schemas.

## identity.yaml

Your personal identity — who you are.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Full name |
| `nickname` | string | | Preferred nickname or alias |
| `headline` | string | | Short professional headline |
| `pronouns` | string | | Preferred pronouns, e.g. "he/him" |
| `bio` | string | ✅ | Short biography (1-3 sentences) |
| `bio_extended` | string | | Longer biography for detailed introductions |
| `photo_url` | string (URL) | | URL to profile photo |
| `location` | object | | Current location |
| `location.city` | string | | City |
| `location.state` | string | | State or region |
| `location.country` | string | ✅* | Country (required if location is provided) |
| `location.timezone` | string | | IANA timezone, e.g. "America/Sao_Paulo" |
| `languages` | array | | Languages spoken |
| `languages[].language` | string | ✅* | Language name |
| `languages[].proficiency` | enum | ✅* | `native`, `fluent`, `advanced`, `intermediate`, `beginner` |
| `contact` | object | | Contact information |
| `contact.email` | string (email) | | Email address |
| `contact.website` | string (URL) | | Personal website |
| `contact.social` | array | | Social media links |
| `contact.social[].platform` | string | ✅* | Platform name |
| `contact.social[].url` | string (URL) | ✅* | Profile URL |
| `contact.social[].username` | string | | Username on the platform |
| `date_of_birth` | string | | Date of birth (YYYY-MM-DD) |
| `nationality` | string | | Nationality |
| `physical` | object | | Optional physical attributes (opt-in only) |
| `physical.height` | string | | Height in any format |
| `physical.weight` | string | | Weight in any format |
| `physical.description` | string | | Free-form physical description |

## career.yaml

Your career history.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `experience` | array | | Work experience (most recent first) |
| `experience[].title` | string | ✅* | Job title |
| `experience[].company` | string | ✅* | Company name |
| `experience[].location` | string | | Work location |
| `experience[].start_date` | string | ✅* | Start date (YYYY-MM or YYYY-MM-DD) |
| `experience[].end_date` | string | | End date (omit if current) |
| `experience[].current` | boolean | | Whether this is the current position |
| `experience[].description` | string | | Role description |
| `experience[].highlights` | string[] | | Key achievements |
| `experience[].technologies` | string[] | | Technologies used |
| `education` | array | | Education history |
| `education[].institution` | string | ✅* | School or university |
| `education[].degree` | string | ✅* | Degree obtained |
| `education[].field` | string | | Field of study |
| `education[].start_date` | string | ✅* | Start date |
| `education[].end_date` | string | | End date |
| `education[].description` | string | | Additional details |
| `education[].gpa` | string | | GPA or equivalent |
| `certifications` | array | | Professional certifications |
| `certifications[].name` | string | ✅* | Certification name |
| `certifications[].issuer` | string | ✅* | Issuing organization |
| `certifications[].date` | string | ✅* | Date obtained |
| `certifications[].expiry` | string | | Expiration date |
| `certifications[].url` | string (URL) | | Verification URL |
| `certifications[].credential_id` | string | | Credential identifier |

## skills.yaml

Your skills and proficiencies.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `technical` | array | | Technical/hard skills |
| `soft` | array | | Soft skills |
| `tools` | array | | Tools and software |
| `languages` | array | | Programming languages |

Each skill item:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Skill name |
| `category` | string | | Category grouping |
| `proficiency` | enum | | `expert`, `advanced`, `intermediate`, `beginner` |
| `years` | number | | Years of experience |
| `description` | string | | Additional context |

## interests.yaml

Your interests and preferences.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hobbies` | string[] | | General hobbies and activities |
| `topics` | string[] | | Topics of interest (often populated by generators) |
| `music` | object | | Music preferences |
| `music.genres` | string[] | | Favorite genres |
| `music.artists` | array | | Favorite artists (interest items) |
| `music.albums` | array | | Favorite albums (interest items) |
| `books` | object | | Reading preferences |
| `books.genres` | string[] | | Favorite genres |
| `books.favorites` | array | | Favorite books (interest items) |
| `books.currently_reading` | array | | Currently reading (interest items) |
| `movies_and_tv` | object | | Movie and TV preferences |
| `food` | object | | Food preferences |
| `food.cuisines` | string[] | | Favorite cuisines |
| `food.dietary` | string | | Dietary restrictions |
| `sports` | object | | Sports interests |
| `sports.practice` | string[] | | Sports actively practiced |
| `sports.follow` | string[] | | Sports followed as a fan |
| `travel` | object | | Travel interests |
| `travel.visited` | string[] | | Places visited |
| `travel.wishlist` | string[] | | Places to visit |

Interest items have: `name` (required), `category`, `note`, `favorite` (boolean), `url`.

## personality.yaml

Your personality traits and values.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `traits` | string[] | | Key personality traits |
| `values` | string[] | | Core personal values |
| `mbti` | string | | Myers-Briggs type, e.g. "INTJ" |
| `enneagram` | string | | Enneagram type, e.g. "5w4" |
| `strengths` | string[] | | Key strengths |
| `weaknesses` | string[] | | Areas for improvement |
| `work_style` | object | | Work style preferences |
| `work_style.preference` | enum | | `remote`, `hybrid`, `office`, `flexible` |
| `work_style.schedule` | string | | Preferred schedule |
| `work_style.collaboration` | string | | Collaboration style |
| `work_style.communication` | string | | Communication style |
| `motivations` | string[] | | What motivates you |
| `fun_facts` | string[] | | Fun or quirky facts |

## goals.yaml

Your goals and aspirations.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `short_term` | array | | Goals for 0-6 months |
| `medium_term` | array | | Goals for 6 months to 2 years |
| `long_term` | array | | Goals for 2+ years |
| `life_goals` | array | | Lifetime aspirations |

Each goal:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Goal title |
| `description` | string | | Detailed description |
| `status` | enum | | `not_started`, `in_progress`, `completed`, `on_hold` |
| `target_date` | string | | Target date (YYYY-MM-DD or YYYY) |
| `category` | string | | Category, e.g. "career", "personal" |

## projects.yaml

Your projects and portfolio.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projects` | array | ✅ | List of projects |

Each project:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Project name |
| `description` | string | ✅ | Short description |
| `url` | string (URL) | | Project URL |
| `repo_url` | string (URL) | | Source code URL |
| `status` | enum | | `active`, `maintained`, `archived`, `concept`, `completed` |
| `technologies` | string[] | | Technologies used |
| `role` | string | | Your role |
| `highlights` | string[] | | Key achievements |
| `start_date` | string | | Start date |
| `end_date` | string | | End date |
| `stars` | number | | GitHub stars or similar |
| `category` | string | | Category |

## faq.yaml

Custom Q&A about yourself.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | ✅ | List of FAQ entries |

Each FAQ item:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ | The question |
| `answer` | string | ✅ | The answer |
| `category` | string | | Category for grouping |
| `tags` | string[] | | Tags for searchability |

## writing/style.yaml (1.1+)

Optional writing voice configuration. See [Identity Model](identity-model.md).

| Field | Type | Description |
|-------|------|-------------|
| `default_profile` | string | Default format profile name |
| `global_voice.tone` | string[] | Shared tone descriptors |
| `global_voice.notes` | string | Free-form voice notes |
| `profiles` | object | Named format profiles |

Each format profile:

| Field | Type | Description |
|-------|------|-------------|
| `format` | string | e.g. blog_post, news_article, social_post |
| `tone` | string[] | Tone descriptors |
| `formality` | enum | casual, neutral, professional, formal |
| `perspective` | enum | first-person, second-person, third-person |
| `typical_length` | string | e.g. "800-1500 words" |
| `corpus_tags` | string[] | Tags to filter corpus entries |

## writing/corpus/ (1.1+)

Markdown files with YAML frontmatter. Each file represents a published text.

Frontmatter fields: `title`, `source`, `url`, `date`, `tags`, `format_profile`, `tone`, `word_count`.

`_manifest.yaml` lists all corpus entries (auto-generated by `mcp-me generate` or `mcp-me sync-corpus`).

## MCP Surface

### Core resources

| URI | Description |
|-----|-------------|
| `me://identity` | Personal identity |
| `me://career` | Work history and education |
| `me://skills` | Skills and proficiencies |
| `me://interests` | Hobbies and topics |
| `me://personality` | Traits and values |
| `me://goals` | Aspirations |
| `me://projects` | Portfolio and articles |
| `me://faq` | Pre-answered Q&A |
| `me://writing/style` | Writing format profiles (1.1+) |
| `me://writing/corpus` | Corpus manifest (1.1+) |
| `me://writing/samples` | Writing excerpts (1.1+) |

### Core tools

| Tool | Description |
|------|-------------|
| `ask_about_me` | Returns profile context for host LLM (not server-side Q&A) |
| `search_profile` | Keyword search across profile |
| `get_profile_completeness` | Fill percentage and suggestions (1.2+) |
| `analyze_writing_style` | Corpus style stats (1.1+) |
| `search_writing_corpus` | Search local writing files (1.1+) |
| `get_writing_references` | Topic-relevant corpus excerpts (1.1+) |

### Core prompts

| Prompt | Description |
|--------|-------------|
| `introduce_me` | 2-paragraph introduction |
| `summarize_career` | Career summary |
| `technical_profile` | Tech stack description |
| `collaboration_fit` | Project fit evaluation |
| `describe_my_writing` | Describe writing style (1.1+) |
| `emulate_my_voice` | Write in user's voice (1.1+) |
| `rewrite_in_my_voice` | Rewrite text in user's voice (1.1+) |

## Plugin Configuration (in .mcp-me.yaml)

Plugin configuration lives in the `plugins:` section of `.mcp-me.yaml`. See [Creating Plugins](creating-plugins.md).

> **Note:** Older versions used a separate `plugins.yaml` file. That file is no longer generated — migrate any settings into `.mcp-me.yaml` under the `plugins:` key.

```yaml
plugins:
  <plugin-name>:
    enabled: true|false
    # ... plugin-specific config options
```
