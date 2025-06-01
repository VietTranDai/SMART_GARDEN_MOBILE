import { StyleSheet } from 'react-native';

export const createJournalStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Compact Content Header (without title/actions - for use with layout header)
  compactContentHeader: {
    backgroundColor: theme.card,
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  // Search Components
  compactSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  compactSearchWrapper: {
    flex: 1,
    marginRight: 12,
  },

  compactSearchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactSearchPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginLeft: 8,
  },

  compactActiveSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.primary,
  },

  compactActiveSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 0,
  },

  compactSearchCloseButton: {
    padding: 4,
  },

  // Action Buttons
  compactActionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  // Search Results
  compactSearchResults: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 0,
    alignItems: 'center',
  },

  compactSearchResultsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
  },

  // Additional required styles for journal
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },

  calendarIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  sectionHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },

  emptyImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  quickStartContainer: {
    marginTop: 24,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
  },

  quickStartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },

  quickStartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  quickStartText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    marginLeft: 12,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },

  loadingText: {
    marginLeft: 10,
    color: theme.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },

  fabIcon: {
    color: '#ffffff',
  },

  // Activity Item Styles
  timelineItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  timelineContainer: {
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },

  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },

  timelineLine: {
    position: 'absolute',
    top: 16,
    width: 2,
    backgroundColor: theme.borderLight,
    bottom: -8,
  },

  journalCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  timeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  timeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },

  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activityTitleContainer: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 2,
  },

  activityType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  detailsContainer: {
    marginBottom: 12,
  },

  detailsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    lineHeight: 20,
  },

  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },

  metadataText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginLeft: 4,
  },

  additionalInfoContainer: {
    marginBottom: 12,
  },

  notesText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    lineHeight: 18,
  },

  labelText: {
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },

  sensorDataGrid: {
    marginTop: 8,
  },

  sensorGroup: {
    marginBottom: 8,
  },

  sensorGroupTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 6,
  },

  sensorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },

  sensorText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginLeft: 4,
  },

  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },

  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginLeft: 4,
  },

  // Filter Styles
  compactFilterContainer: {
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  compactFilterHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.backgroundSecondary,
  },

  compactFilterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactFilterHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginLeft: 6,
  },

  compactFilterBadge: {
    marginLeft: 8,
    backgroundColor: theme.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  compactFilterBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },

  compactFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  compactFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  compactFilterItem: {
    flex: 1,
    marginHorizontal: 4,
  },

  compactFilterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.text,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactPickerWrapper: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactPickerStyle: {
    height: 52,
    color: theme.text,
  },

  compactFilterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },

  compactFilterStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    flex: 1,
  },

  compactFilterError: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.error,
    flex: 1,
  },

  compactClearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactClearButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginLeft: 4,
  },

  // Analytics Button
  compactAnalyticsButton: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactAnalyticsButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  compactAnalyticsButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginLeft: 6,
  },

  compactAnalyticsButtonTextActive: {
    color: '#FFFFFF',
  },

  compactActiveFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.backgroundSecondary,
  },

  compactActiveFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
    maxWidth: 120,
  },

  compactActiveFilterText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
    marginRight: 4,
    flex: 1,
  },

  compactActiveFilterRemove: {
    padding: 2,
  },

  // Additional styles for index.tsx
  errorText: {
    color: theme.error,
    textAlign: 'center',
    padding: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },

  emptyButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: theme.background,
  },
}); 