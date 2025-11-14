# Questionnaire Frontend Implementation

## Overview

Complete frontend implementation for the questionnaire system with admin builder, analytics dashboard, and API integration.

## Files Created

### Pages
- **`src/pages/Questionnaires.tsx`** - Main questionnaire management page
  - List all questionnaires
  - Filter by position
  - Create/Edit/Delete/Activate templates
  - View analytics

### Components
- **`src/components/questionnaires/QuestionnaireBuilder.tsx`** - Builder interface
  - Create/edit questionnaire templates
  - Add/remove questions
  - Add/remove options
  - Mark correct answers
  - Configure points and scoring mode

- **`src/components/questionnaires/QuestionnaireAnalytics.tsx`** - Analytics dashboard
  - Template statistics (total responses, avg score, avg percentage)
  - Question-by-question analysis
  - Option distribution charts
  - Visual indicators for correct/incorrect options

### Services
- **`src/services/api.ts`** - Added `questionnaireApi` with methods:
  - Template CRUD
  - Question CRUD
  - Option CRUD
  - Response submission
  - Analytics endpoints

### Routing
- **`src/App.tsx`** - Added `/questionnaires` route
- **`src/components/Sidebar.tsx`** - Added "Questionários" menu item

## Features

### 1. Questionnaire List
- Grid view of all templates
- Filter by position
- Status indicators (Active/Inactive)
- Quick stats (questions count, total points)
- Actions: Edit, Analytics, Activate/Deactivate, Delete

### 2. Builder Interface
- **Template Info**: Title and position key
- **Questions**: Add/remove/reorder questions
- **Question Settings**:
  - Question text (textarea)
  - Type (multi-select / single-select)
  - Points (decimal)
  - Scoring mode (all-or-nothing / partial)
- **Options**: Add/remove options with checkbox for correct answers
- **Validation**: Ensures all questions have text, at least 2 options, and at least 1 correct answer

### 3. Analytics Dashboard
- **Overview Cards**:
  - Total Responses
  - Average Score
  - Average Percentage
- **Question Analysis**:
  - Select question dropdown
  - Option distribution bars
  - Visual indicators for correct answers
  - Selection counts and percentages

## Usage

### Access
Navigate to `/painel/questionnaires` or click "Questionários" in the sidebar.

### Create Questionnaire
1. Click "Novo Questionário"
2. Fill in title and position
3. Add questions with "Adicionar Questão"
4. For each question:
   - Enter question text
   - Select type and configure points
   - Add options with "+ Adicionar Opção"
   - Check boxes for correct answers
5. Click "Salvar"

### Edit Questionnaire
1. Click "Editar" on a template card
2. Modify questions/options
3. Click "Salvar" (creates new version)

### View Analytics
1. Click "Analytics" on a template card
2. View overview stats
3. Select questions to see option distribution

### Activate/Deactivate
- Click "Ativar" to make a template active (only one per position)
- Click "Desativar" to deactivate
- Active templates are shown to candidates

## API Integration

All API calls use the `questionnaireApi` service:

```typescript
import { questionnaireApi } from '../services/api';

// Get all templates
const templates = await questionnaireApi.getTemplates();

// Get active template for position
const template = await questionnaireApi.getActiveTemplate('Painter');

// Create template
const newTemplate = await questionnaireApi.createTemplate({
  title: 'Safety Test',
  position_key: 'Painter',
  version: 1,
  is_active: false,
});

// Submit response (for candidate form integration)
const result = await questionnaireApi.submitResponse({
  candidate_id: 123,
  template_id: 1,
  answers: [
    { question_id: 1, selected_option_ids: [1, 2] }
  ],
});
```

## Styling

Uses Tailwind CSS with:
- Indigo/Purple color scheme (matching app theme)
- Responsive grid layouts
- Hover effects and transitions
- Loading spinners
- Status badges (green for active, gray for inactive)

## Next Steps

### Candidate Form Integration
To integrate questionnaires into the candidate application form:

1. **Fetch template when position is selected**:
```typescript
const template = await questionnaireApi.getActiveTemplate(positionKey);
```

2. **Render questions dynamically**:
```tsx
{template.questions.map(question => (
  <div key={question.id}>
    <h3>{question.question_text}</h3>
    {question.options.map(option => (
      <label key={option.id}>
        <input
          type={question.question_type === 'multi_select' ? 'checkbox' : 'radio'}
          name={`question_${question.id}`}
          value={option.id}
        />
        {option.option_text}
      </label>
    ))}
  </div>
))}
```

3. **Submit with candidate data**:
```typescript
const answers = collectAnswers(); // Your logic to collect selected options
await questionnaireApi.submitResponse({
  candidate_id: candidateId,
  template_id: template.id,
  answers,
});
```

## Testing

1. **Create a template**:
   - Go to Questionários
   - Click "Novo Questionário"
   - Fill in "Safety Test" / "Painter"
   - Add 2-3 questions with options
   - Mark correct answers
   - Save

2. **Activate template**:
   - Click "Ativar" on the template card

3. **View analytics** (after some responses):
   - Click "Analytics"
   - Select questions to see distribution

## Troubleshooting

### Template not appearing
- Check if `is_active` is true
- Verify `position_key` matches exactly

### Save fails
- Ensure all questions have text
- Ensure each question has at least 2 options
- Ensure each question has at least 1 correct answer

### Analytics empty
- No responses submitted yet
- Check backend API is running

## Dependencies

All dependencies already in package.json:
- React
- React Router
- Axios
- Lucide React (icons)
- Tailwind CSS

No additional packages needed!

## Summary

Complete questionnaire management system with:
- ✅ Admin builder UI
- ✅ Analytics dashboard
- ✅ Full CRUD operations
- ✅ API integration
- ✅ Responsive design
- ✅ Form validation
- ✅ Ready for candidate form integration

The frontend is production-ready and fully integrated with the backend API!
