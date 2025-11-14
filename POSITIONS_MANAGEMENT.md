# Positions Management (Cargos Disponíveis)

## Overview

The Positions page allows admins to manage the job positions that appear in the candidate application form dropdown.

## Features

- ✅ **Add new positions** - Create custom job titles
- ✅ **Edit positions** - Rename existing positions
- ✅ **Delete positions** - Remove positions
- ✅ **Activate/Deactivate** - Control which positions show in the form
- ✅ **Real-time sync** - Changes immediately reflect in the application form

## How It Works

### Storage
- Positions are stored in **localStorage** (browser storage)
- Key: `available_positions`
- Format: Array of position objects

### Position Object
```typescript
{
  id: number,           // Unique identifier
  name: string,         // Position name (e.g., "Pintor")
  is_active: boolean,   // Whether it shows in form
  created_at: string    // ISO date string
}
```

### Default Positions
When first loaded, these default positions are created:
1. Pintor
2. Auxiliar de Pintor
3. Encarregado de Pintura

## Usage

### Access the Page
1. Navigate to `/painel/positions` or click "Cargos" in sidebar
2. You'll see a list of all positions

### Add New Position
1. Click "Novo Cargo" button
2. Type the position name (e.g., "Supervisor de Pintura")
3. Click "Salvar" or press Enter
4. Position is created as **active** by default

### Edit Position
1. Click the edit icon (pencil) next to a position
2. Modify the name
3. Click the save icon (checkmark) or press Enter
4. Click X to cancel

### Delete Position
1. Click the trash icon next to a position
2. Confirm deletion
3. Position is removed permanently

### Activate/Deactivate
1. Click the status badge (Ativo/Inativo)
2. Status toggles immediately
3. **Only active positions** appear in the application form

## Integration with Application Form

### How Positions Load
1. Admin manages positions at `/painel/positions`
2. Positions are saved to localStorage
3. Application form reads from localStorage on page load
4. Dropdown is populated with **active positions only**

### Form Dropdown
```html
<select name="position_applied" id="id_position_applied">
  <option value="">Selecione um cargo...</option>
  <option value="Pintor">Pintor</option>
  <option value="Auxiliar de Pintor">Auxiliar de Pintor</option>
  <!-- Only active positions appear -->
</select>
```

### Questionnaire Loading
- When candidate selects a position
- Questionnaire is fetched based on `position_key`
- `position_key` must match the position name exactly

## Example Workflow

### 1. Admin Creates Positions
```
/painel/positions
→ Add "Pintor"
→ Add "Auxiliar de Pintor"
→ Add "Encarregado"
→ Deactivate "Encarregado" (not hiring now)
```

### 2. Admin Creates Questionnaires
```
/painel/questionnaires
→ Create questionnaire for "Pintor"
→ Create questionnaire for "Auxiliar de Pintor"
→ Activate both
```

### 3. Candidate Applies
```
Application Form
→ Sees dropdown with: "Pintor", "Auxiliar de Pintor"
→ Selects "Pintor"
→ Proceeds to Step 2
→ Questionnaire for "Pintor" loads automatically
```

## Important Notes

### Position Name Matching
⚠️ **The position name must match exactly** between:
- Positions page (`name` field)
- Questionnaire template (`position_key` field)
- Application form dropdown (`value` attribute)

Example:
```
Position: "Pintor"
Questionnaire position_key: "Pintor"
Form value: "Pintor"
✅ Match - questionnaire will load
```

```
Position: "Pintor"
Questionnaire position_key: "pintor"
❌ No match - questionnaire won't load (case-sensitive)
```

### Data Persistence
- Data is stored in **browser localStorage**
- Data persists across sessions
- Data is **per-browser** (not synced across devices)
- Clearing browser data will reset positions

### Multi-User Considerations
Since localStorage is per-browser:
- Each admin sees their own positions list
- To share positions across admins, they need to:
  1. Export positions (future feature)
  2. Or manually recreate them
  3. Or use same browser/device

## Future Enhancements

Potential improvements:
- [ ] **Backend storage** - Store in database instead of localStorage
- [ ] **API endpoints** - CRUD operations via API
- [ ] **Import/Export** - Share positions between admins
- [ ] **Position categories** - Group positions by department
- [ ] **Position descriptions** - Add job descriptions
- [ ] **Usage statistics** - Track how many candidates per position

## Troubleshooting

### Positions Not Showing in Form
1. Check positions are **active** (green badge)
2. Refresh the application form page
3. Check browser console for errors
4. Verify localStorage has data: `localStorage.getItem('available_positions')`

### Positions Disappeared
1. Browser data may have been cleared
2. Re-add positions manually
3. Consider implementing backend storage

### Questionnaire Not Loading
1. Verify position name matches exactly (case-sensitive)
2. Check questionnaire exists for that position
3. Check questionnaire is active
4. Check browser console for API errors

## Technical Details

### localStorage Key
```javascript
localStorage.getItem('available_positions')
```

### Data Structure
```json
[
  {
    "id": 1,
    "name": "Pintor",
    "is_active": true,
    "created_at": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Auxiliar de Pintor",
    "is_active": true,
    "created_at": "2025-01-15T10:01:00.000Z"
  }
]
```

### Form Integration Script
Location: `apps/candidate/static/candidate/js/questionnaire-integration.js`

Function: `loadPositions()`
- Reads from localStorage
- Filters active positions
- Populates dropdown

## Summary

✅ **Simple management** - Add/edit/delete positions easily  
✅ **Real-time updates** - Changes reflect immediately  
✅ **Active/Inactive control** - Show only relevant positions  
✅ **Seamless integration** - Works with questionnaire system  
✅ **User-friendly** - Intuitive interface  

The Positions page provides a simple way to manage job titles without touching code or database!
