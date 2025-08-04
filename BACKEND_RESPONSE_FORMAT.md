# Backend Response Format Guide

## Expected Response Structure

The frontend `ResultDisplay` component is designed to parse and display structured responses from the AI. The backend returns responses using markdown `**` formatting, which the frontend automatically converts to HTML `<strong>` tags for better structure and compatibility.

### Recommended Format

The backend returns markdown formatting, which the frontend automatically converts to HTML:

**Backend Output (Markdown):**

```
**Situation:** [Brief description of the argument/debate context]

**Friend 1:** [First person's perspective and reasoning]

**Friend 2:** [Second person's perspective and reasoning]

**The Verdict:** [AI's analysis and conclusion on who is right]
```

**Frontend Processing (HTML Conversion):**

```
<strong>Situation:</strong> [Brief description of the argument/debate context]

<strong>Friend 1:</strong> [First person's perspective and reasoning]

<strong>Friend 2:</strong> [Second person's perspective and reasoning]

<strong>The Verdict:</strong> [AI's analysis and conclusion on who is right]
```

### Example Response

```
**Situation:** Cairns trip vs. work deadline. The age-old question of sunshine versus spreadsheets.

**Friend 1:** Thinks they might have to cancel the whole shebang or lug work with them. Sounds like a holiday buzzkill.

**Friend 2:** Says, "Chill out, let's go on the trip and deal with work later!" Classic, carefree attitude.

**The Verdict:** Hmm... This is a tough one. Friend 1 sounds like they're already picturing themselves chained to a laptop, and let's be honest, that's no fun. Friend 2 is right. Vacations are for vacations, not for turning into office zombies. Enjoy the sunshine and worry about the deadline when you get back. Good luck with your next argument.
```

### Key Formatting Rules

1. **Section Headers**: Use `**Section Name:**` format (markdown) - the frontend converts to HTML automatically
2. **Content**: Place the content immediately after the colon, with proper spacing
3. **No Code Blocks**: The response should NOT be wrapped in `html or ` code blocks
4. **Sections**: The frontend recognizes these section names:
   - `Situation` - Background context
   - `[Person 1 Name]` - First person's view (e.g., "Friend 1", "Woman", "Mom", etc.)
   - `[Person 2 Name]` - Second person's view (e.g., "Friend 2", "Man", "Child", etc.)
   - `The Verdict` or `Verdict` - AI's conclusion

### Alternative Formats

The frontend can handle variations in section names:

**Markdown Format (Backend Output):**

- `**Friend A:**` instead of `**Friend 1:**`
- `**Friend B:**` instead of `**Friend 2:**`
- `**Verdict:**` instead of `**The Verdict:**`
- Any person name variations based on the debate type (Woman/Man, Mom/Child, Boss/Employee, etc.)

### Fallback Handling

If the response doesn't follow the structured format, the frontend will:

1. Remove any markdown code blocks (`html, `, etc.)
2. Convert any remaining `**text**` to `<strong>text</strong>` for consistency
3. Display the text as-is with line breaks preserved
4. Attempt to parse any `<strong>Section:</strong>` patterns it finds
5. Apply basic formatting for readability

### Visual Styling

The frontend automatically applies different visual styles to each section:

- **Situation**: Blue gradient background with blue accent
- **Friend Views**: Green gradient background with green accent
- **Verdict**: Red gradient background with red accent

This creates a clear visual hierarchy and makes the response easy to read and understand.
