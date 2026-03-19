# LinkedIn Plugin

Provides professional history from LinkedIn exported data in JSON format.

## Getting Your LinkedIn Data

1. Go to [LinkedIn Settings > Data Privacy](https://www.linkedin.com/mypreferences/d/download-my-data)
2. Request a copy of your data
3. Download and extract the archive
4. Convert the relevant CSV files to JSON, or use the full `Profile.json` export

## Configuration

Add to your `.mcp-me.yaml`:

```yaml
plugins:
  linkedin:
    enabled: true
    data_path: "./linkedin-export.json"   # path to your exported data
```

## Expected JSON Format

The plugin expects a JSON file with this structure (fields are all optional):

```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "headline": "Software Engineer",
    "summary": "Experienced developer...",
    "location": "San Francisco, CA",
    "industryName": "Technology"
  },
  "positions": [
    {
      "title": "Senior Engineer",
      "companyName": "Acme Corp",
      "location": "Remote",
      "description": "Led backend development...",
      "startDate": { "month": 1, "year": 2022 },
      "endDate": null
    }
  ],
  "education": [
    {
      "schoolName": "MIT",
      "degreeName": "B.S.",
      "fieldOfStudy": "Computer Science",
      "startDate": { "year": 2014 },
      "endDate": { "year": 2018 }
    }
  ],
  "skills": [
    { "name": "TypeScript" },
    { "name": "Python" }
  ]
}
```

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | `me://linkedin/profile` | Profile summary and headline |
| Experience | `me://linkedin/experience` | Work history |
| Education | `me://linkedin/education` | Education history |
| Skills | `me://linkedin/skills` | Listed skills |

## Tools

| Tool | Description |
|------|-------------|
| `search_linkedin_data` | Search through all LinkedIn export data |
