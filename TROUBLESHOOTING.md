# Questionnaire System - Troubleshooting

## Common Issues and Solutions

### 1. "templates.map is not a function" Error

**Symptom**: 
```
Uncaught TypeError: templates.map is not a function
```

**Cause**: 
The Django REST Framework returns paginated responses in the format:
```json
{
  "count": 10,
  "next": "http://...",
  "previous": null,
  "results": [...]
}
```

Instead of a plain array `[...]`.

**Solution**: 
The frontend code now handles both formats:
```typescript
const data = await questionnaireApi.getTemplates();
const templatesList = Array.isArray(data) 
  ? data 
  : ((data as any)?.results || []);
setTemplates(templatesList);
```

**Status**: ✅ Fixed in `src/pages/Questionnaires.tsx`

---

### 2. TypeScript "Cannot find module" Error for QuestionnaireAnalytics

**Symptom**:
```
Cannot find module '../components/questionnaires/QuestionnaireAnalytics'
```

**Cause**: 
TypeScript cache not updated after creating new files.

**Solution**: 
1. Restart TypeScript server in your IDE
2. Or restart your dev server
3. Or delete `node_modules/.cache` and restart

**Status**: ⚠️ Cache issue - will resolve on restart

---

### 3. 401 Unauthorized on API Calls

**Symptom**: 
API calls fail with 401 status.

**Cause**: 
Not logged in or token expired.

**Solution**: 
1. Ensure you're logged in at `/painel/login`
2. Check that JWT token is valid
3. Verify permissions (templates require admin)

---

### 4. Empty Template List

**Symptom**: 
"Nenhum questionário encontrado" even after creating templates.

**Cause**: 
- No templates created yet
- API endpoint not accessible
- Backend not running

**Solution**: 
1. Check backend is running: `python manage.py runserver`
2. Check API manually: `curl http://localhost:8000/api/questionnaires/`
3. Create a template via Django admin first to test

---

### 5. Cannot Save Template

**Symptom**: 
"Erro ao salvar questionário" alert.

**Cause**: 
- Validation failed
- Missing required fields
- Backend error

**Solution**: 
1. Ensure all questions have text
2. Ensure each question has at least 2 options
3. Ensure each question has at least 1 correct answer
4. Check browser console for detailed error
5. Check backend logs for server errors

---

### 6. Analytics Shows No Data

**Symptom**: 
Analytics page shows "Nenhuma resposta registrada".

**Cause**: 
No candidate responses submitted yet.

**Solution**: 
1. Submit test responses via API:
```bash
curl -X POST http://localhost:8000/api/questionnaire-responses/submit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidate_id": 1,
    "template_id": 1,
    "answers": [
      {"question_id": 1, "selected_option_ids": [1, 2]}
    ]
  }'
```
2. Or integrate questionnaire into candidate form

---

### 7. CORS Errors

**Symptom**: 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause**: 
Frontend and backend on different ports without CORS configured.

**Solution**: 
Backend already has CORS configured in `settings.py`. Ensure:
1. Frontend uses proxy in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```
2. Or backend CORS allows your frontend origin

---

### 8. Questions Not Showing in Builder

**Symptom**: 
Questions don't appear when editing a template.

**Cause**: 
- API not returning questions
- Questions not prefetched

**Solution**: 
Backend already prefetches: `prefetch_related('questions__options')`
Check:
1. Template has questions in Django admin
2. API response includes questions: `GET /api/questionnaires/{id}/`
3. Browser console for errors

---

### 9. Cannot Activate Template

**Symptom**: 
"Erro ao ativar/desativar questionário"

**Cause**: 
- Permission denied (not admin)
- Template doesn't exist
- Backend error

**Solution**: 
1. Ensure logged in as admin user
2. Check template exists
3. Check backend logs
4. Try via Django admin first

---

### 10. Duplicate Templates After Save

**Symptom**: 
Multiple templates created instead of updating.

**Cause**: 
Edit mode creates new version instead of updating.

**Solution**: 
This is by design - editing increments version. To truly update:
1. Delete old version
2. Or modify backend to update in place
3. Current behavior preserves history

---

## Debug Checklist

When something doesn't work:

1. **Check Backend**:
   - [ ] Backend server running?
   - [ ] Migrations applied? `python manage.py migrate`
   - [ ] Admin accessible? `http://localhost:8000/admin/`
   - [ ] API accessible? `http://localhost:8000/api/questionnaires/`

2. **Check Frontend**:
   - [ ] Dev server running? `npm run dev`
   - [ ] No console errors?
   - [ ] Logged in?
   - [ ] Correct route? `/painel/questionnaires`

3. **Check Data**:
   - [ ] Templates exist in database?
   - [ ] Questions have options?
   - [ ] At least one template is active?

4. **Check Permissions**:
   - [ ] User is admin/staff?
   - [ ] JWT token valid?
   - [ ] CORS configured?

---

## Getting Help

If issues persist:

1. **Check Logs**:
   - Backend: Terminal running Django server
   - Frontend: Browser console (F12)

2. **Check Documentation**:
   - `docs/QUESTIONNAIRE_SYSTEM.md` - Backend API
   - `QUESTIONNAIRE_FRONTEND.md` - Frontend guide
   - `QUESTIONNAIRE_COMPLETE_SUMMARY.md` - Full overview

3. **Test API Directly**:
```bash
# Get templates
curl http://localhost:8000/api/questionnaires/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create template
curl -X POST http://localhost:8000/api/questionnaires/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Test", "position_key": "Painter", "version": 1}'
```

4. **Check Django Admin**:
   - Go to `/admin/candidate/questionnairetemplate/`
   - Verify data exists
   - Try CRUD operations there first

---

## Known Limitations

1. **Pagination**: Backend returns paginated results (100 per page). Frontend handles this automatically.

2. **Version History**: Editing creates new version instead of updating. Old versions remain in database.

3. **No Drag & Drop**: Question reordering must be done manually via order field.

4. **TypeScript Cache**: May need to restart IDE/server after creating new files.

5. **Single Active Template**: Only one template per position can be active at a time (by design).

---

## Quick Fixes

### Reset Everything
```bash
# Backend
cd ficha-backend
source venv/bin/activate
python manage.py flush  # WARNING: Deletes all data!
python manage.py migrate
python manage.py createsuperuser

# Frontend
cd ficha-frontend
rm -rf node_modules/.cache
npm run dev
```

### Test Data
Create test template via Django shell:
```python
python manage.py shell

from apps.candidate.models import QuestionnaireTemplate, Question, QuestionOption

template = QuestionnaireTemplate.objects.create(
    title="Test Questionnaire",
    position_key="Painter",
    version=1,
    is_active=True
)

question = Question.objects.create(
    template=template,
    question_text="Test question?",
    question_type="multi_select",
    order=1,
    points=5.0
)

QuestionOption.objects.create(
    question=question,
    option_text="Option 1",
    is_correct=True,
    order=1
)

QuestionOption.objects.create(
    question=question,
    option_text="Option 2",
    is_correct=False,
    order=2
)
```

---

**Last Updated**: 2025-01-15  
**System Version**: 1.0.0
