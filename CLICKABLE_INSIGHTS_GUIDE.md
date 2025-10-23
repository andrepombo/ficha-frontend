# Clickable Insights Charts - User Guide

## Overview
The Insights page now features **interactive charts** that allow you to click on any segment to instantly view the filtered list of candidates on the Dashboard page.

## How to Use

### 1. Navigate to Insights Page
- Click on "Insights" in the sidebar navigation
- View the various pie charts and bar charts displaying candidate demographics

### 2. Click on Any Chart Segment
Simply click on any segment of a chart to filter candidates by that criteria:

#### **Available Interactive Charts:**

**Disponibilidade para Início** (Availability to Start)
- Click on: Imediato, 15 dias, 30 dias, or A combinar
- Filters: `availability`

**Disponibilidade para Viagens** (Travel Availability)
- Click on: Sim or Não
- Filters: `travel_availability`

**Pintura em Altura** (Height Painting)
- Click on: Sim or Não
- Filters: `height_painting`

**Transporte Próprio** (Own Transportation)
- Click on: Sim or Não
- Filters: `transportation`

**Atualmente Empregado** (Currently Employed)
- Click on: Sim or Não
- Filters: `currently_employed`

**Distribuição por Gênero** (Gender Distribution)
- Click on: Masculino, Feminino, or Prefiro não informar
- Filters: `gender`

**Pessoas com Deficiência (PCD)** (Disability)
- Click on: Sem deficiência, Física, Auditiva, Visual, Mental, Múltipla, or Reabilitado
- Filters: `disability`

**Como Souberam da Vaga** (How They Found the Vacancy)
- Click on: Facebook, Instagram, LinkedIn, Sine, Indicação, or Outros
- Filters: `how_found_vacancy`

### 3. View Filtered Results
- After clicking, you'll be automatically redirected to the Dashboard
- The Dashboard will show only candidates matching your selected criteria
- The filter is visible in the URL (e.g., `/dashboard?gender=masculino`)
- All time periods are shown (month/year filters are cleared when coming from Insights)

### 4. Visual Feedback
- Charts now show a **pointer cursor** when hovering over clickable segments
- This indicates the segment is interactive

## Technical Details

### URL Parameters
When you click on a chart segment, the following URL parameters are used:

| Chart Type | Parameter | Possible Values |
|------------|-----------|-----------------|
| Gender | `gender` | `masculino`, `feminino`, `prefiro_nao_informar` |
| Disability | `disability` | `sem_deficiencia`, `fisica`, `auditiva`, `visual`, `mental`, `multipla`, `reabilitado` |
| Transportation | `transportation` | `sim`, `nao` |
| Referral Source | `how_found_vacancy` | `facebook`, `instagram`, `linkedin`, `sine`, `indicacao_colaborador`, `outros` |
| Availability | `availability` | `imediato`, `15_dias`, `30_dias`, `a_combinar` |
| Travel | `travel_availability` | `sim`, `nao` |
| Height Painting | `height_painting` | `sim`, `nao` |
| Employment | `currently_employed` | `sim`, `nao` |

### Dashboard Behavior
- When URL parameters are present, the Dashboard automatically applies those filters
- Default month/year filters are cleared to show all matching candidates across all periods
- You can still apply additional filters using the FilterBar or Advanced Search
- Export functionality (PDF/Excel) respects the applied filters

## Use Cases

### Example 1: Find All Female Candidates
1. Go to Insights page
2. Scroll to "Distribuição por Gênero" chart
3. Click on the "Feminino" segment
4. Dashboard opens showing only female candidates

### Example 2: Find Candidates with Own Transportation
1. Go to Insights page
2. Find "Transporte Próprio" chart
3. Click on the "Sim" segment
4. Dashboard opens showing only candidates with their own transportation

### Example 3: Find Candidates Who Found Vacancy via LinkedIn
1. Go to Insights page
2. Scroll to "Como Souberam da Vaga" chart
3. Click on the "LinkedIn" bar
4. Dashboard opens showing only candidates who found the vacancy via LinkedIn

## Benefits

✅ **Quick Filtering** - One click to filter candidates by any demographic criteria
✅ **Data-Driven Decisions** - Easily explore candidate segments identified in insights
✅ **Seamless Navigation** - Smooth transition from insights to detailed candidate list
✅ **Flexible Analysis** - Combine with other Dashboard filters for deeper analysis
✅ **Export Ready** - Filtered results can be immediately exported to PDF or Excel

## Tips

💡 **Combine Filters**: After clicking from Insights, you can apply additional filters on the Dashboard for more specific results

💡 **Clear Filters**: To see all candidates again, simply click "Dashboard" in the sidebar or clear the filters manually

💡 **Export Filtered Data**: Use the PDF or Excel export buttons on the Dashboard to export your filtered candidate list

💡 **Bookmark Filters**: You can bookmark specific filter URLs for quick access later

## Troubleshooting

**Q: The filter doesn't seem to work**
- Check that you're clicking directly on a chart segment (not empty space)
- Ensure you have candidates in your database matching that criteria

**Q: I want to see all candidates again**
- Click "Dashboard" in the sidebar to reset to default view
- Or manually change the URL to `/dashboard`

**Q: Can I apply multiple filters from Insights?**
- Currently, each click applies one filter
- You can add more filters using the Dashboard's FilterBar or Advanced Search after navigation

## Future Enhancements

Potential improvements for future versions:
- Multi-select filtering (click multiple segments before navigating)
- Filter combination from multiple charts
- Back button to return to Insights with context
- Tooltip showing candidate count before clicking

---

**Implementation Date**: October 2025
**Compatible With**: Dashboard Advanced Search, Export Features, Scoring System
